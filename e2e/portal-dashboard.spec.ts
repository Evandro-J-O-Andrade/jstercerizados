import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env') });

import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const CANDIDATE_EMAIL = process.env.CANDIDATE_EMAIL;
const CANDIDATE_PASSWORD = process.env.CANDIDATE_PASSWORD;
const CANDIDATE_REAL_EMAIL = process.env.CANDIDATE_REAL_EMAIL;
const CANDIDATE_REAL_PASSWORD = process.env.CANDIDATE_REAL_PASSWORD;

test.setTimeout(120000);

async function loginAs(
  page: any,
  email: string,
  password: string,
  context: 'admin' | 'candidato' | 'empresa' = 'admin',
) {
  await page.goto('http://localhost:3004/login');
  await page.waitForLoadState('networkidle');

  const skipButton = page.getByRole('button', { name: 'Pular' });
  if ((await skipButton.count()) > 0) {
    await skipButton.click();
    await page.waitForLoadState('networkidle');
  }

  const contextButton = page.getByRole('button', {
    name:
      context === 'admin'
        ? 'Admin'
        : context === 'candidato'
          ? 'Candidato'
          : 'Empresa',
  });
  if ((await contextButton.count()) > 0) {
    await contextButton.first().click();
    await page.waitForLoadState('networkidle');
  }

  await page
    .locator('input[type="email"], input[type="text"]')
    .first()
    .fill(email);
  await page.locator('input[type="password"]').fill(password);

  // Check what's on the page
  const pageContent = await page.content();
  console.log('PAGE HAS TURNSTILE:', pageContent.includes('turnstile'));
  console.log(
    'PAGE HAS CAPTCHA:',
    pageContent.includes('CAPTCHA') || pageContent.includes('captcha'),
  );

  // Try to find and interact with Turnstile
  const turnstileWidget = page.locator('[data-turnstile-mode="managed"]');
  if ((await turnstileWidget.count()) > 0) {
    console.log('Found Turnstile widget');
    // Wait a bit for Turnstile to render
    await page.waitForTimeout(3000);

    // Check if token is present
    const hasToken = await page.evaluate(() => {
      const widget = document.querySelector(
        '[data-turnstile-has-token="true"]',
      );
      return widget !== null;
    });
    console.log('Turnstile has token:', hasToken);
  }

  const responses: any[] = [];
  page.on('response', (response) => {
    const url = response.url();
    if (
      url.includes('supabase') ||
      url.includes('auth') ||
      url.includes('token') ||
      url.includes('signIn') ||
      url.includes('functions/v1')
    ) {
      responses.push({ url, status: response.status() });
      response
        .json()
        .then((body) =>
          console.log(
            'RESPONSE:',
            url,
            response.status(),
            JSON.stringify(body),
          ),
        )
        .catch(() => {});
    }
  });

  await page.locator('button[type="submit"]').click();

  await page.waitForTimeout(5000);

  console.log(
    'CAPTURED RESPONSES:',
    responses.map((r) => `${r.status} ${r.url}`),
  );

  const errorAlert = page
    .locator('alert, [role="alert"], .alert, .error, [class*="error"]')
    .first();
  if (await errorAlert.isVisible({ timeout: 1000 })) {
    const errorText = await errorAlert.textContent();
    console.log('LOGIN ERROR:', errorText);
  }
}

async function waitForDashboard(page: any) {
  try {
    await page.waitForURL(/\/(dashboard|auth\/welcome|candidato)/, {
      timeout: 30_000,
    });
  } catch (e) {
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);
    const bodyText = await page.locator('body').innerText();
    console.log('Page content:', bodyText.slice(0, 1000));
    throw e;
  }

  if (page.url().includes('/auth/welcome')) {
    // Try both button texts for new/returning users
    const continueButton = page.getByRole('button', { name: /Continuar/i });
    const accessButton = page.getByRole('button', {
      name: /Acessar minha área/i,
    });

    if (await continueButton.isVisible({ timeout: 1000 })) {
      await continueButton.click();
    } else if (await accessButton.isVisible({ timeout: 1000 })) {
      await accessButton.click();
    } else {
      // Fallback: click any button in the welcome page
      const anyButton = page.locator('button[type="submit"]').first();
      if (await anyButton.isVisible({ timeout: 1000 })) {
        await anyButton.click();
      }
    }
    await page.waitForURL(/\/(dashboard|candidato)/, { timeout: 15_000 });
  }
}

test.describe('Portal Dashboard - Real User E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3004');
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem('jst_intro_complete', '1');
      } catch {}
    });
    await page.context().clearCookies();
  });

  test.describe('Admin Master (evandro_j.o.a@hotmail.com)', () => {
    test('logs in and reaches portal dashboard with MetroTiles', async ({
      page,
    }) => {
      test.skip(
        !ADMIN_EMAIL || !ADMIN_PASSWORD,
        'Missing ADMIN_EMAIL or ADMIN_PASSWORD',
      );

      await loginAs(page, ADMIN_EMAIL!, ADMIN_PASSWORD!);
      await waitForDashboard(page);

      await expect(page).toHaveURL(/\/dashboard$/);
      await expect(page).not.toHaveURL(/\/login/);
      await expect(page).not.toHaveURL(/404/);

      const main = page.locator('main');
      await expect(main).toBeVisible();

      await expect(page.getByText(/Página não encontrada/i)).not.toBeVisible();
      await expect(page.getByText(/Acesso negado/i)).not.toBeVisible();
    });

    test('portal dashboard has MetroTiles grid with module cards', async ({
      page,
    }) => {
      test.skip(
        !ADMIN_EMAIL || !ADMIN_PASSWORD,
        'Missing ADMIN_EMAIL or ADMIN_PASSWORD',
      );

      await loginAs(page, ADMIN_EMAIL!, ADMIN_PASSWORD!);
      await waitForDashboard(page);

      await expect(page).toHaveURL(/\/dashboard$/);

      await expect(page.locator('main')).toBeVisible();

      await expect(
        page.getByText(/Módulos autorizados|Gestão Global/i),
      ).toBeVisible({ timeout: 10_000 });

      const tileGrid = page.locator(
        '[role="list"][aria-label="Módulos do sistema"]',
      );
      await expect(tileGrid).toBeVisible({ timeout: 10_000 });

      const tiles = tileGrid.locator(
        '[role="listitem"], .metro-tile, [style*="grid-column"]',
      );
      await expect(tiles.first()).toBeVisible({ timeout: 5_000 });

      console.log('Tile count:', await tiles.count());
    });

    test('portal header shows user info, module context, and logout button', async ({
      page,
    }) => {
      test.skip(
        !ADMIN_EMAIL || !ADMIN_PASSWORD,
        'Missing ADMIN_EMAIL or ADMIN_PASSWORD',
      );

      await loginAs(page, ADMIN_EMAIL!, ADMIN_PASSWORD!);
      await waitForDashboard(page);

      await expect(page.locator('header')).toBeVisible();

      await expect(page.getByText(/Seja bem-vindo/i)).toBeVisible();

      await expect(page.getByText(/J&S Empregos/i)).toBeVisible();

      const userMenu = page.getByRole('button', {
        name: /trocar conta|meu perfil|segurança|sair/i,
      });
      await expect(userMenu.first()).toBeVisible();

      const backToSite = page.getByRole('button', {
        name: /Voltar para o site/i,
      });
      await expect(backToSite).toBeVisible();
    });

    test('portal sidebar opens with hamburger menu and has "Início do sistema"', async ({
      page,
    }) => {
      test.skip(
        !ADMIN_EMAIL || !ADMIN_PASSWORD,
        'Missing ADMIN_EMAIL or ADMIN_PASSWORD',
      );

      await loginAs(page, ADMIN_EMAIL!, ADMIN_PASSWORD!);
      await waitForDashboard(page);

      const hamburger = page.getByRole('button', { name: /Abrir menu/i });
      await expect(hamburger).toBeVisible();
      await hamburger.click();

      await expect(page.locator('aside[aria-label="Portal"]')).toBeVisible({
        timeout: 3_000,
      });

      await expect(page.getByText(/Início do sistema/i)).toBeVisible({
        timeout: 3_000,
      });
    });

    test('portal footer shows company name and "Desenvolvido por New Wave Sistemas"', async ({
      page,
    }) => {
      test.skip(
        !ADMIN_EMAIL || !ADMIN_PASSWORD,
        'Missing ADMIN_EMAIL or ADMIN_PASSWORD',
      );

      await loginAs(page, ADMIN_EMAIL!, ADMIN_PASSWORD!);
      await waitForDashboard(page);

      await expect(page.locator('footer')).toBeVisible();

      await expect(page.getByText(/J&S Empregos LTDA/i)).toBeVisible();

      await expect(
        page.getByText(/Desenvolvido por New Wave Sistemas/i),
      ).toBeVisible();
    });

    test('can navigate to recrutamento module', async ({ page }) => {
      test.skip(
        !ADMIN_EMAIL || !ADMIN_PASSWORD,
        'Missing ADMIN_EMAIL or ADMIN_PASSWORD',
      );

      await loginAs(page, ADMIN_EMAIL!, ADMIN_PASSWORD!);
      await waitForDashboard(page);

      const recrutamentoTile = page
        .locator('[role="list"][aria-label="Módulos do sistema"]')
        .locator('a, button')
        .filter({ hasText: /Recrutamento/i });
      if ((await recrutamentoTile.count()) > 0) {
        await recrutamentoTile.first().click();
        await page.waitForURL('**/recrutamento', { timeout: 10_000 });
        await expect(page).toHaveURL(/\/recrutamento/);
        await expect(page.getByText(/Recrutamento/i)).toBeVisible();
      }
    });
  });

  test.describe('Candidate (darkangelyas.yash@gmail.com)', () => {
    test('logs in and reaches candidate area', async ({ page }) => {
      test.skip(
        !CANDIDATE_EMAIL || !CANDIDATE_PASSWORD,
        'Missing CANDIDATE_REAL_EMAIL or CANDIDATE_REAL_PASSWORD',
      );

      await loginAs(page, CANDIDATE_EMAIL!, CANDIDATE_PASSWORD!);
      await waitForDashboard(page);

      await expect(page).not.toHaveURL(/\/login/);
      await expect(page).not.toHaveURL(/404/);

      const main = page.locator('main');
      await expect(main).toBeVisible();

      await expect(page.getByText(/Página não encontrada/i)).not.toBeVisible();
    });

    test('candidate dashboard shows vagas or candidaturas', async ({
      page,
    }) => {
      test.skip(
        !CANDIDATE_EMAIL || !CANDIDATE_PASSWORD,
        'Missing CANDIDATE_REAL_EMAIL or CANDIDATE_REAL_PASSWORD',
      );

      await loginAs(page, CANDIDATE_EMAIL!, CANDIDATE_PASSWORD!);
      await waitForDashboard(page);

      await page.waitForURL(/\/(candidato|dashboard)/, { timeout: 15_000 });

      const mainText = await page.locator('main').innerText();
      console.log('Candidate dashboard text:', mainText.slice(0, 500));

      const hasContent =
        mainText.includes('Vaga') ||
        mainText.includes('Candidatura') ||
        mainText.includes('Perfil') ||
        mainText.includes('Currículo') ||
        mainText.length > 100;

      expect(hasContent).toBeTruthy();
    });
  });

  test.describe('Session persistence', () => {
    test('stays logged in after page reload', async ({ page }) => {
      test.skip(
        !ADMIN_EMAIL || !ADMIN_PASSWORD,
        'Missing ADMIN_EMAIL or ADMIN_PASSWORD',
      );

      await loginAs(page, ADMIN_EMAIL!, ADMIN_PASSWORD!);
      await waitForDashboard(page);

      await expect(page).toHaveURL(/\/dashboard$/);

      await page.reload();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page).not.toHaveURL(/\/login/);
      await expect(page.locator('main')).toBeVisible();
    });
  });
});
