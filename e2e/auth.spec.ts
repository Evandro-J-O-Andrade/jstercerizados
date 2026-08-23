import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env') });

import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function login(page: any) {
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  const skipButton = page.getByRole('button', { name: 'Pular' });
  if ((await skipButton.count()) > 0) {
    await skipButton.click();
    await page.waitForLoadState('networkidle');
  }

  await page
    .locator('input[type="email"], input[type="text"]')
    .first()
    .fill(ADMIN_EMAIL!);
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD!);
  await page.locator('button[type="submit"]').click();
}

test.describe('Auth flow', () => {
  test('shows login page', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');

    const skipButton = page.getByRole('button', { name: 'Pular' });
    if ((await skipButton.count()) > 0) {
      await skipButton.click();
      await page.waitForLoadState('networkidle');
    }

    await page.screenshot({ path: 'login-page.png', fullPage: true });
    await expect(
      page.locator('input[type="email"], input[type="text"]').first(),
    ).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Entrar' }).last(),
    ).toBeVisible();
  });

  test('redirects authenticated admin to /dashboard', async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      test.skip('Missing ADMIN_EMAIL or ADMIN_PASSWORD');
      return;
    }

    await login(page);

    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/404/);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('authenticated user reaches dashboard without redirect loop', async ({
    page,
  }) => {
    test.skip(
      !ADMIN_EMAIL || !ADMIN_PASSWORD,
      'Missing E2E_ADMIN_EMAIL or E2E_ADMIN_PASSWORD',
    );

    const visitedUrls: string[] = [];

    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        visitedUrls.push(frame.url());
      }
    });

    await login(page);

    await expect
      .poll(() => new URL(page.url()).pathname, {
        timeout: 10_000,
      })
      .toBe('/dashboard');

    expect(visitedUrls).not.toContain(expect.stringContaining('/404'));

    expect(
      visitedUrls.filter((url) => url.includes('/login')).length,
    ).toBeLessThanOrEqual(1);

    await expect(page).toHaveURL(/\/dashboard$/);

    await expect(page.locator('main')).toBeVisible();
  });

  test('authenticated user does not return to login after dashboard loads', async ({
    page,
  }) => {
    test.skip(
      !ADMIN_EMAIL || !ADMIN_PASSWORD,
      'Missing E2E_ADMIN_EMAIL or E2E_ADMIN_PASSWORD',
    );

    await login(page);

    await page.waitForURL('**/dashboard', {
      timeout: 10_000,
    });

    await page.waitForTimeout(1_000);

    expect(new URL(page.url()).pathname).toBe('/dashboard');

    await expect(page).not.toHaveURL(/\/login/);
  });

  test('dashboard renders according to authenticated permissions', async ({
    page,
  }) => {
    test.skip(
      !ADMIN_EMAIL || !ADMIN_PASSWORD,
      'Missing E2E_ADMIN_EMAIL or E2E_ADMIN_PASSWORD',
    );

    await login(page);

    await page.waitForURL('**/dashboard', {
      timeout: 10_000,
    });

    await expect(page).toHaveURL(/\/dashboard$/);

    await expect(page.locator('main')).toBeVisible();

    await expect(page.getByText(/página não encontrada/i)).not.toBeVisible();

    await expect(page.getByText(/acesso negado/i)).not.toBeVisible();
  });
});
