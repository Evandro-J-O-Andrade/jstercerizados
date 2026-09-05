import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env') });

import { test, expect, type Page } from '@playwright/test';

const CANDIDATE_EMAIL = process.env.CANDIDATE_EMAIL;
const CANDIDATE_PASSWORD = process.env.CANDIDATE_PASSWORD;

const CINEMA_MS = 10500;
const NAVIGATION_ITEMS = [
  'Início',
  'Vagas',
  'Candidaturas',
  'Favoritas',
  'Currículo',
  'Perfil',
  'Notificações',
  'Configurações',
];

async function waitForAuthReady(page: Page) {
  await page.goto('http://localhost:3000/login');
  await page
    .locator('input[type="email"], input[type="text"]')
    .first()
    .fill(CANDIDATE_EMAIL || '');
  await page.locator('input[type="password"]').first().fill(CANDIDATE_PASSWORD || '');
  await page.locator('button[type="submit"]').first().click();
}

test.describe('Candidate Portal — Runtime Canonical Spec', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
    });
  });

  test('cinema → login → /candidato → CandidateShell → 8 navegações', async ({
    page,
  }) => {
    test.skip(
      !CANDIDATE_EMAIL || !CANDIDATE_PASSWORD,
      'CANDIDATE_EMAIL / CANDIDATE_PASSWORD missing in .env',
    );

    page.on('response', async (resp) => {
      const u = resp.url();
      if (u.includes('supabase') || u.includes('/rest/')) {
        if (resp.status() >= 400) {
          console.log('[browser:resp]', resp.status(), u);
        }
        if (u.includes('AUTH:FLOW')) {
          console.log('[browser:auth-flow]', u, resp.status());
        }
      }
    });

    await waitForAuthReady(page);

    await page.waitForURL(/\/(auth\/welcome|auth\/terms|candidato)/, {
      timeout: 30_000,
    });

    if (page.url().includes('/auth/welcome')) {
      await page
        .getByRole('button', { name: /Acessar minha área/i })
        .first()
        .click();
    }
    if (page.url().includes('/auth/terms')) {
      await page
        .getByRole('button', { name: /aceito|concordo|continuar/i })
        .first()
        .click();
      await page
        .getByRole('button', { name: /Acessar minha área/i })
        .first()
        .click();
    }

    await page.waitForURL('**/candidato', { timeout: 20_000 });

    await expect(page).toHaveURL(/\/candidato/);

    await expect(
      page.locator('header span.text-sm.font-medium'),
    ).toHaveText('Área do Candidato');

    await expect(page.getByText('Olá,')).toBeVisible();

    for (const label of NAVIGATION_ITEMS) {
      await expect(page.getByRole('link', { name: label })).toBeVisible({
        timeout: 5_000,
      });
    }

    const main = await page.locator('main').innerText();
    expect(main).not.toContain('Gestão Global');
    expect(main).not.toContain('Admin Master');
    expect(main).not.toContain('Administração');

    const spinner = page.locator('.animate-pulse');
    await expect(spinner).toHaveCount(0, { timeout: 6_000 });
  });

  test('F5 mantém sessão e permanece em /candidato', async ({ page }) => {
    test.skip(
      !CANDIDATE_EMAIL || !CANDIDATE_PASSWORD,
      'CANDIDATE_EMAIL / CANDIDATE_PASSWORD missing in .env',
    );

    await waitForAuthReady(page);

    if (page.url().includes('/auth/welcome')) {
      await page
        .getByRole('button', { name: /Acessar minha área/i })
        .first()
        .click();
    }

    await page.waitForURL('**/candidato', { timeout: 20_000 });

    await expect(page).toHaveURL(/\/candidato/);

    await page.reload();

    await Promise.race([
      page.waitForURL(/\/candidato/),
      page.waitForTimeout(CINEMA_MS + 5000),
    ]);

    await expect(page).toHaveURL(/\/candidato/, { timeout: 15_000 });

    await expect(
      page.locator('header span.text-sm.font-medium'),
    ).toHaveText('Área do Candidato');

    const spinner = page.locator('.animate-pulse');
    await expect(spinner).toHaveCount(0, { timeout: 6_000 });
  });

  test('sem erros de console de contexto ou Fast Refresh', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (
        text.includes('useCandidate must be used within') ||
        text.includes('Fast Refresh') ||
        text.includes('incompatible')
      ) {
        consoleErrors.push(text);
        console.log('[console:error]', msg.type(), text);
      }
      if (text.includes('WARNING') && msg.type() === 'warning') {
        consoleWarnings.push(text);
      }
    });

    test.skip(
      !CANDIDATE_EMAIL || !CANDIDATE_PASSWORD,
      'CANDIDATE_EMAIL / CANDIDATE_PASSWORD missing in .env',
    );

    await waitForAuthReady(page);

    if (page.url().includes('/auth/welcome')) {
      await page
        .getByRole('button', { name: /Acessar minha área/i })
        .first()
        .click();
    }

    await page.waitForURL('**/candidato', { timeout: 20_000 });

    expect(consoleErrors).toHaveLength(0);
  });
});
