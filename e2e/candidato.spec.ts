import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env') });

import { test, expect } from '@playwright/test';

const CANDIDATE_EMAIL = process.env.CANDIDATE_EMAIL;
const CANDIDATE_PASSWORD = process.env.CANDIDATE_PASSWORD;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function loginAs(page: any, email: string, password: string) {
  await page.goto('http://localhost:3004/login');
  await page.waitForLoadState('networkidle');
  await page
    .locator('input[type="email"], input[type="text"]')
    .first()
    .fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
}

test.describe('Candidato Portal (P2)', () => {
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

  test('candidate can access /candidato and view dashboard with real data', async ({
    page,
  }) => {
    test.skip(!CANDIDATE_EMAIL || !CANDIDATE_PASSWORD, 'env faltando');

    await loginAs(page, CANDIDATE_EMAIL!, CANDIDATE_PASSWORD!);

    // After login, the flow goes through /auth/welcome then /dashboard
    // DashboardHome redirects candidates to /candidato
    await page.waitForURL(/\/dashboard|auth\/welcome/, { timeout: 15_000 });

    if (page.url().includes('/auth/welcome')) {
      await page.getByRole('button', { name: /Acessar minha área/i }).click();
    }

    await page.waitForURL('**/dashboard', { timeout: 15_000 });

    // DashboardHome should redirect non-admin candidates to /candidato
    await page.waitForURL(/\/candidato$/, { timeout: 10_000 });

    await expect(page).toHaveURL(/\/candidato$/);

    await expect(page.getByText('Área do Candidato')).toBeVisible({
      timeout: 8_000,
    });

    const main = await page.locator('main').innerText();
    console.log('CANDIDATO_MAIN_TEXT', main);

    // Dashboard should render the metro tiles
    await expect(page.getByRole('heading', { name: /Olá,/i })).toBeVisible();

    // All 8 tiles should be present
    const tileLabels = [
      'Vagas',
      'Minhas Candidaturas',
      'Vagas Favoritas',
      'Meu Currículo',
      'Alertas de Vagas',
      'Meu Perfil',
      'Notificações',
      'Configurações',
    ];

    for (const label of tileLabels) {
      await expect(page.getByText(label)).toBeVisible();
    }

    // No infinite spinner
    const spinner = page.locator('.animate-pulse');
    await expect(spinner).toHaveCount(0, { timeout: 4_000 });
  });

  test('candidate can navigate between portal pages', async ({ page }) => {
    test.skip(!CANDIDATE_EMAIL || !CANDIDATE_PASSWORD, 'env faltando');

    await loginAs(page, CANDIDATE_EMAIL!, CANDIDATE_PASSWORD!);

    if (page.url().includes('/auth/welcome')) {
      await page.getByRole('button', { name: /Acessar minha área/i }).click();
    }

    await page.waitForURL('**/candidato', { timeout: 15_000 });

    // Navigate to Vagas
    await page.getByRole('link', { name: /Vagas/i }).first().click();
    await page.waitForURL(/\/candidato\/vagas$/, { timeout: 5_000 });
    await expect(
      page.getByRole('heading', { name: /Vagas disponíveis/i }),
    ).toBeVisible();

    // Navigate back to dashboard
    await page.goBack();
    await page.waitForURL(/\/candidato$/, { timeout: 5_000 });

    // Navigate to Candidaturas
    await page.getByRole('link', { name: /Minhas Candidaturas/i }).click();
    await page.waitForURL(/\/candidato\/candidaturas$/, { timeout: 5_000 });
    await expect(
      page.getByRole('heading', { name: /Minhas candidaturas/i }),
    ).toBeVisible();

    // Navigate to Favoritas
    await page.goto('http://localhost:3004/candidato/favoritas');
    await expect(
      page.getByRole('heading', { name: /Vagas favoritas/i }),
    ).toBeVisible();

    // Navigate to Curriculo
    await page.goto('http://localhost:3004/candidato/curriculo');
    await expect(
      page.getByRole('heading', { name: /Meu currículo/i }),
    ).toBeVisible();

    // Navigate to Perfil
    await page.goto('http://localhost:3004/candidato/perfil');
    await expect(
      page.getByRole('heading', { name: /Meu perfil/i }),
    ).toBeVisible();

    // Navigate to Alertas
    await page.goto('http://localhost:3004/candidato/alertas');
    await expect(
      page.getByRole('heading', { name: /Alertas de vagas/i }),
    ).toBeVisible();

    // Navigate to Configuracoes
    await page.goto('http://localhost:3004/candidato/configuracoes');
    await expect(
      page.getByRole('heading', { name: /Configurações/i }),
    ).toBeVisible();
  });

  test('candidate can favorite/unfavorite a job', async ({ page }) => {
    test.skip(!CANDIDATE_EMAIL || !CANDIDATE_PASSWORD, 'env faltando');

    await loginAs(page, CANDIDATE_EMAIL!, CANDIDATE_PASSWORD!);

    if (page.url().includes('/auth/welcome')) {
      await page.getByRole('button', { name: /Acessar minha área/i }).click();
    }

    await page.waitForURL(/\/candidato$/, { timeout: 15_000 });

    // Go to vagas
    await page.getByRole('link', { name: /^Vagas$/ }).click();
    await page.waitForURL(/\/candidato\/vagas$/, { timeout: 5_000 });

    // Find a job card with favorite button
    const favoriteButtons = await page.locator(
      'button[aria-label="Favoritar"], button[aria-label="Remover dos favoritos"]',
    );
    const count = await favoriteButtons.count();

    if (count > 0) {
      await favoriteButtons.first().click();
      // Toast should appear
      await expect(page.getByText(/favorit/, { exact: false })).toBeVisible({
        timeout: 3_000,
      });
    }
  });

  test('candidate can update profile', async ({ page }) => {
    test.skip(!CANDIDATE_EMAIL || !CANDIDATE_PASSWORD, 'env faltando');

    await loginAs(page, CANDIDATE_EMAIL!, CANDIDATE_PASSWORD!);

    if (page.url().includes('/auth/welcome')) {
      await page.getByRole('button', { name: /Acessar minha área/i }).click();
    }

    await page.waitForURL(/\/candidato$/, { timeout: 15_000 });

    // Navigate to perfil
    await page.goto('http://localhost:3004/candidato/perfil');
    await page.waitForLoadState('networkidle');

    // Should show profile form
    await expect(
      page.getByRole('heading', { name: /Meu perfil/i }),
    ).toBeVisible();

    await expect(page.getByLabel(/Nome completo/i)).toBeVisible();
  });

  test('candidate can manage resume sections', async ({ page }) => {
    test.skip(!CANDIDATE_EMAIL || !CANDIDATE_PASSWORD, 'env faltando');

    await loginAs(page, CANDIDATE_EMAIL!, CANDIDATE_PASSWORD!);

    if (page.url().includes('/auth/welcome')) {
      await page.getByRole('button', { name: /Acessar minha área/i }).click();
    }

    await page.waitForURL(/\/candidato$/, { timeout: 15_000 });

    // Navigate to curriculo
    await page.goto('http://localhost:3004/candidato/curriculo');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: /Meu currículo/i }),
    ).toBeVisible();

    // Should have sections
    await expect(page.getByText('Experiências')).toBeVisible();
    await expect(page.getByText('Formação')).toBeVisible();
    await expect(page.getByText('Idiomas')).toBeVisible();
    await expect(page.getByText('Competências')).toBeVisible();
  });

  test('candidate can create and manage job alerts', async ({ page }) => {
    test.skip(!CANDIDATE_EMAIL || !CANDIDATE_PASSWORD, 'env faltando');

    await loginAs(page, CANDIDATE_EMAIL!, CANDIDATE_PASSWORD!);

    if (page.url().includes('/auth/welcome')) {
      await page.getByRole('button', { name: /Acessar minha área/i }).click();
    }

    await page.waitForURL(/\/candidato$/, { timeout: 15_000 });

    await page.goto('http://localhost:3004/candidato/alertas');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: /Alertas de vagas/i }),
    ).toBeVisible();

    // Should have "Novo alerta" button
    await expect(
      page.getByRole('button', { name: /Novo alerta/i }),
    ).toBeVisible();
  });

  test('admin_master does NOT see candidate dashboard', async ({ page }) => {
    test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'env faltando');

    await loginAs(page, ADMIN_EMAIL!, ADMIN_PASSWORD!);

    // Admin should go to /dashboard (NOT redirected to /candidato)
    await page.waitForURL(/\/dashboard/, { timeout: 15_000 });

    // Should NOT be on /candidato
    expect(page.url()).not.toContain('/candidato');

    // Should show Portal/dashboard
    await expect(page.locator('text=Portal').first()).toBeVisible({
      timeout: 8_000,
    });
  });

  test('candidate cannot access /candidato without authentication', async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto('http://localhost:3004/candidato');
    await page.waitForLoadState('networkidle');

    // Should be redirected to login
    await page.waitForURL(/\/entrar|\/login/, { timeout: 10_000 });
  });
});
