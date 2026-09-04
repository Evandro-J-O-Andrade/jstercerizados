import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env') });

import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function loginAs(page: any, email: string, password: string) {
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page
    .locator('input[type="email"], input[type="text"]')
    .first()
    .fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
}

test.describe('Dashboard do Candidato (P0 fix)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem('jst_intro_complete', '1');
      } catch {}
    });
    await page.context().clearCookies();
  });

  test('admin_master entra e acessa /dashboard/candidato sem loading infinito', async ({
    page,
  }) => {
    test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'env faltando');

    page.on('response', async (resp) => {
      const u = resp.url();
      if (resp.status() >= 400 && (u.includes('supabase') || u.includes('/rest/'))) {
        console.log('[browser:resp]', resp.status(), u);
        try {
          const t = await resp.text();
          console.log('[browser:resp.body]', t.slice(0, 600));
        } catch {}
      }
    });

    await loginAs(page, ADMIN_EMAIL!, ADMIN_PASSWORD!);
    // admin_master pode ir direto para /dashboard (welcome_completed_at já setado)
    // ou para /auth/welcome (primeiro acesso) — aceitamos ambos.
    await page.waitForURL(/\/(dashboard|auth\/welcome)/, { timeout: 15_000 });

    if (page.url().includes('/auth/welcome')) {
      await page.getByRole('button', { name: /Acessar minha área/i }).click();
    }
    await page.waitForURL('**/dashboard', { timeout: 15_000 });

    await page.goto('http://localhost:3000/dashboard/candidato');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/dashboard\/candidato$/);

    await expect(page.getByText('Área do Candidato')).toBeVisible({
      timeout: 8_000,
    });

    const main = await page.locator('main').innerText();
    console.log('CANDIDATO_MAIN_TEXT', main);

    const isAdminWithoutCandidate =
      main.includes('Perfil não encontrado') ||
      main.includes('cadastro de candidato ainda não foi criado');

    if (isAdminWithoutCandidate) {
      await expect(
        page.getByText(/cadastro de candidato ainda não foi criado/i),
      ).toBeVisible();
    } else {
      await expect(page.getByText('Ações rápidas')).toBeVisible({
        timeout: 8_000,
      });
    }

    const spinner = page.locator('.animate-pulse');
    await expect(spinner).toHaveCount(0, { timeout: 4_000 });
  });
});

