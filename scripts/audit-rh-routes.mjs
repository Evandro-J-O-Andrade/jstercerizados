import { chromium } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

config({ path: '.env.local' });

const baseURL = process.env.ROUTE_AUDIT_BASE_URL ?? 'http://127.0.0.1:3000';
const outputRoot = path.resolve(
  process.env.ROUTE_AUDIT_OUTPUT ?? 'evidence/rh-visual-2026-11-09',
);
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

if (!adminEmail || !adminPassword || !supabaseUrl || !supabaseKey) {
  throw new Error('Credenciais locais de Auth/Supabase não estão configuradas para a auditoria autenticada.');
}

const authClient = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
  email: adminEmail,
  password: adminPassword,
});
if (authError || !authData.session) {
  throw new Error(`Não foi possível criar a sessão real de auditoria: ${authError?.message ?? 'sessão ausente'}`);
}
const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
const authStorageKey = `sb-${projectRef}-auth-token`;

const routes = [
  ['dashboard', '/dashboard/rh'],
  ['colaboradores', '/dashboard/rh/colaboradores'],
  ['novo-colaborador', '/dashboard/rh/colaboradores/novo'],
];

const requestedViewport = process.env.ROUTE_AUDIT_VIEWPORT;
const viewports = [
  ['desktop', { width: 1440, height: 1000 }, 'dark'],
  ['mobile', { width: 390, height: 844 }, 'dark'],
  ['desktop-light', { width: 1440, height: 1000 }, 'light'],
].filter(([name]) => !requestedViewport || name === requestedViewport);

await mkdir(outputRoot, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = [];

async function dismissIntro(page) {
  const skipIntro = page.getByRole('button', { name: 'Pular' });
  await skipIntro.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
  if (await skipIntro.isVisible().catch(() => false)) {
    await skipIntro.click();
    await skipIntro.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
    await page.waitForTimeout(1_000);
  }
}

async function ensureAuthenticated(page) {
  await dismissIntro(page);
  if (!page.url().includes('/login')) return;

  const adminContext = page.getByRole('button', { name: 'Admin' });
  if (await adminContext.isVisible().catch(() => false)) await adminContext.click();
  await page.locator('input[type="email"], input[type="text"]').first().fill(adminEmail);
  await page.locator('input[type="password"]').fill(adminPassword);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(dashboard|auth\/welcome|selecionar-tenant)/, { timeout: 30_000 });

  if (page.url().includes('/auth/welcome')) {
    const continueButton = page.getByRole('button', { name: /Continuar|Acessar minha área/i }).first();
    if (await continueButton.isVisible().catch(() => false)) await continueButton.click();
    await page.waitForURL(/\/(dashboard|selecionar-tenant)/, { timeout: 15_000 });
  }
}

async function selectTenantContext(page) {
  await page.goto(`${baseURL}/selecionar-tenant`, {
    waitUntil: 'domcontentloaded',
    timeout: 30_000,
  });
  await dismissIntro(page);
  const tenantOption = page.locator('input[type="radio"][name="tenant"]').first();
  if (!(await tenantOption.isVisible().catch(() => false))) {
    throw new Error('A conta de auditoria não possui tenant selecionável para validar Recrutamento.');
  }
  await tenantOption.check();
  await page.getByRole('button', { name: 'Confirmar contexto' }).click();
  await page.waitForURL(/\/dashboard\//, { timeout: 30_000 });
}

for (const [viewportName, viewport, colorScheme] of viewports) {
  const context = await browser.newContext({
    viewport,
    colorScheme,
  });
  await context.addInitScript(
    ({ key, session, theme }) => {
      localStorage.setItem(key, JSON.stringify(session));
      localStorage.setItem('jst-theme', theme);
    },
    { key: authStorageKey, session: authData.session, theme: colorScheme },
  );
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });

  await page.goto(`${baseURL}/dashboard/rh`, {
    waitUntil: 'domcontentloaded',
    timeout: 30_000,
  });
  await ensureAuthenticated(page);
  await selectTenantContext(page);

  await page.goto(`${baseURL}/dashboard/rh/colaboradores`, {
    waitUntil: 'domcontentloaded',
    timeout: 30_000,
  });
  await page.getByRole('heading', { name: 'Gerenciar colaboradores' }).waitFor({ timeout: 15_000 });
  const detailHref = await page
    .locator('a[href^="/dashboard/rh/colaboradores/"]:not([href$="/novo"]):not([href$="/editar"])')
    .first()
    .getAttribute('href')
    .catch(() => null);
  const contextRoutes = detailHref
    ? [
        ...routes,
        ['detalhes-colaborador', detailHref],
        ['editar-colaborador', `${detailHref}/editar`],
      ]
    : routes;

  for (const [name, route] of contextRoutes) {
    errors.length = 0;
    const response = await page.goto(`${baseURL}${route}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    await ensureAuthenticated(page);
    await page.locator('h1').first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(1_000);
    const facts = await page.evaluate(() => {
      const visible = (element) => {
        if (!(element instanceof HTMLElement)) return false;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      };
      const text = (selector) =>
        [...document.querySelectorAll(selector)]
          .filter(visible)
          .map((element) => element.textContent?.trim())
          .filter(Boolean);
      return {
        title: document.title,
        pathname: location.pathname,
        headings: text('h1'),
        visibleHeaders: [...document.querySelectorAll('header')].filter(visible).length,
        visibleAsides: [...document.querySelectorAll('aside')].filter(visible).length,
        visibleMains: [...document.querySelectorAll('main')].filter(visible).length,
        visibleFooters: [...document.querySelectorAll('footer')].filter(visible).length,
        navLabels: [...document.querySelectorAll('nav[aria-label]')]
          .filter(visible)
          .map((element) => element.getAttribute('aria-label')),
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
      };
    });

    const directory = path.join(outputRoot, viewportName);
    await mkdir(directory, { recursive: true });
    await page.screenshot({
      path: path.join(directory, `${name}.png`),
      fullPage: true,
    });
    report.push({
      viewport: viewportName,
      route,
      status: response?.status() ?? null,
      errors: [...errors],
      ...facts,
    });
  }
  await context.close();
}

await browser.close();
await writeFile(
  path.join(outputRoot, 'audit.json'),
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8',
);
console.log(JSON.stringify(report, null, 2));
