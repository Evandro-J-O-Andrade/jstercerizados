import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3001';

test.describe('Post-login flow validation', () => {
  let consoleMessages = [];

  test.beforeEach(async ({ page }) => {
    consoleMessages = [];
    page.on('console', (msg) => {
      const text = `[${msg.type()}] ${msg.text()}`;
      consoleMessages.push(text);
    });
    page.on('pageerror', (err) => {
      consoleMessages.push(`[pageerror] ${err.message}`);
    });
  });

  function hasCinema(html) {
    return html.includes('Abertura cinematográfica');
  }

  test('should load cinema on initial visit', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    const html = await page.content();
    expect(hasCinema(html)).toBe(true);
  });

  test('should show login page at /login', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'load' });
    await page.waitForTimeout(500);

    // Wait for the cinema intro to finish (total duration ~6s) if it appears.
    // Use a longer timeout to account for initial render.
    const cinemaSelector = 'span:has-text("Abertura cinematográfica")';
    const hasCinema = await page
      .locator(cinemaSelector)
      .isVisible()
      .catch(() => false);
    if (hasCinema) {
      await page.waitForTimeout(8000);
    }

    const html = await page.content();
    expect(html).toContain('Entrar no painel');
  });

  test('admin login should redirect to dashboard', async ({ page }) => {
    const email = process.env.ADMIN_EMAIL || 'evandro_j.o.a@hotmail.com';
    const password = process.env.ADMIN_PASSWORD || '@An29070818';

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);

    const navPromise = page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => null);

    await page.click('button[type="submit"]');

    const result = await navPromise;
    const finalUrl = page.url();
    const authLogs = consoleMessages.filter((m) => m.includes('[AUTH'));

    console.log('ADMIN LOGIN RESULT:');
    console.log('  Final URL:', finalUrl);
    console.log('  Redirected to /dashboard:', result !== null);
    console.log('  AUTH LOGS:');
    authLogs.forEach((log) => console.log('    ' + log));

    expect(result).not.toBeNull();
  });

  test('should not show cinema after login', async ({ page }) => {
    const email = process.env.ADMIN_EMAIL || 'evandro_j.o.a@hotmail.com';
    const password = process.env.ADMIN_PASSWORD || '@An29070818';

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);

    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => null);

    await page.waitForTimeout(1000);
    const html = await page.content();
    const hasCinemaAfter = hasCinema(html);

    console.log('Cinema after login:', hasCinemaAfter);
    expect(hasCinemaAfter).toBe(false);
  });

  test('SPA navigation should not re-show cinema', async ({ page }) => {
    const email = process.env.ADMIN_EMAIL || 'evandro_j.o.a@hotmail.com';
    const password = process.env.ADMIN_PASSWORD || '@An29070818';

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);

    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => null);
    await page.waitForTimeout(1000);

    await page.goto(`${BASE}/dashboard/tenants`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const html = await page.content();
    const hasCinemaAfter = hasCinema(html);

    console.log('Cinema after SPA nav:', hasCinemaAfter);
    expect(hasCinemaAfter).toBe(false);
  });

  test('F5 reload should not re-show cinema', async ({ page }) => {
    const email = process.env.ADMIN_EMAIL || 'evandro_j.o.a@hotmail.com';
    const password = process.env.ADMIN_PASSWORD || '@An29070818';

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);

    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => null);
    await page.waitForTimeout(1000);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const html = await page.content();
    const hasCinemaAfter = hasCinema(html);

    console.log('Cinema after F5:', hasCinemaAfter);
    expect(hasCinemaAfter).toBe(false);
  });

  test('unauthenticated access should redirect to login', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
    await page.waitForURL('**/login**', { timeout: 10000 }).catch(() => null);
    await page.waitForTimeout(500);

    const finalUrl = page.url();
    console.log('Unauthenticated access final URL:', finalUrl);
    expect(finalUrl).toContain('/login');
  });

  test('candidate login should redirect to /candidato', async ({ page }) => {
    const email = process.env.CANDIDATE_EMAIL || 'candidato.diag@test.local';
    const password = process.env.CANDIDATE_PASSWORD || 'Auditoria@2026';

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);

    const navPromise = page.waitForURL('**/candidato**', { timeout: 15000 }).catch(() => null);

    await page.click('button[type="submit"]');

    const result = await navPromise;
    const finalUrl = page.url();
    const authLogs = consoleMessages.filter((m) => m.includes('[AUTH'));

    console.log('CANDIDATE LOGIN RESULT:');
    console.log('  Final URL:', finalUrl);
    console.log('  Redirected to /candidato:', result !== null);
    console.log('  AUTH LOGS:');
    authLogs.forEach((log) => console.log('    ' + log));

    expect(result).not.toBeNull();
  });
});