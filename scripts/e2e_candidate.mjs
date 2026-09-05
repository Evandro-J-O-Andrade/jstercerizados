// Browser E2E simulation via headless
import { chromium } from 'playwright';

const URL = 'http://localhost:3000';
const EMAIL = process.env.CAND_EMAIL || 'candidato.diag@test.local';
const PASSWORD = process.env.CAND_PASSWORD || 'Auditoria@2026';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('response', (r) => {
    const u = r.url();
    if (r.status() >= 400 && (u.includes('supabase') || u.includes('/rest/'))) {
      console.log('[NET ERR]', r.status(), u);
    }
  });
  page.on('console', (msg) => {
    const t = msg.text();
    if (t.includes('[AUTH') || t.includes('error') || t.includes('Error') || t.includes('RLS') || t.includes('legal')) {
      console.log('[CONSOLE]', msg.type(), t.slice(0, 250));
    }
  });
  page.on('response', async (r) => {
    const u = r.url();
    if (r.status() >= 400 && (u.includes('supabase') || u.includes('/rest/') || u.includes('legal'))) {
      console.log('[NET ERR]', r.status(), u);
      try { console.log('[BODY]', (await r.text()).slice(0, 300)); } catch {}
    }
  });
  page.on('pageerror', (e) => console.log('[PAGE ERR]', e.message));

  try {
    console.log('1) goto /login');
    await page.goto(`${URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    console.log('2) fill email');
    await page.locator('input[type="email"]').first().fill(EMAIL);
    await page.locator('input[type="password"]').first().fill(PASSWORD);
    await page.locator('button[type="submit"]').first().click();

    console.log('3) wait for redirect');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(5000);

    const url = page.url();
    console.log('4) current url:', url);

    if (url.includes('/candidato')) {
      console.log('SUCCESS — landed on /candidato');
      const main = await page.locator('main').innerText().catch(() => '');
      console.log('--- main text (first 500) ---');
      console.log(main.slice(0, 500));
      const hasShell = await page.locator('text=Área do Candidato').count();
      console.log('Has "Área do Candidato":', hasShell > 0);
    } else if (url.includes('/auth/terms')) {
      console.log('4b) on /auth/terms — accepting');
      // Scroll the scrollable content to the bottom to satisfy scrolledToBottom gate
      const scrolled = await page.evaluate(() => {
        const candidates = document.querySelectorAll('div, main, article, section');
        for (const el of candidates) {
          if (el.scrollHeight > el.clientHeight + 4) {
            el.scrollTop = el.scrollHeight;
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) return true;
          }
        }
        window.scrollTo(0, document.body.scrollHeight);
        return true;
      });
      console.log('scrolled:', scrolled);
      await page.waitForTimeout(500);
      // Check the terms checkbox
      const cb = page.locator('input[type="checkbox"]').first();
      if (await cb.count() > 0) {
        await cb.check({ force: true }).catch(() => {});
      }
      await page.waitForTimeout(300);
      const acceptBtn = page.getByRole('button', { name: /Aceitar|Aceito|Concordo|Aceitar e continuar/i }).first();
      if (await acceptBtn.count() > 0) {
        await acceptBtn.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        await acceptBtn.click({ force: true });
        await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
        await page.waitForTimeout(6000);
        const url2 = page.url();
        console.log('5) after accept:', url2);
        const main = await page.locator('main').innerText().catch(() => '');
        console.log('--- main text (first 500) ---');
        console.log(main.slice(0, 500));
        const hasShell = await page.locator('text=Área do Candidato').count();
        console.log('Has "Área do Candidato":', hasShell > 0);
      } else {
        console.log('No accept button found');
      }
    } else {
      console.log('WARN — did not land on /candidato');
      const title = await page.title();
      console.log('Title:', title);
      const body = await page.locator('body').innerText().catch(() => '');
      console.log('--- body (first 800) ---');
      console.log(body.slice(0, 800));
    }

    console.log('5) take screenshot');
    await page.screenshot({ path: 'tmp_candidate_e2e.png', fullPage: true });
  } catch (e) {
    console.error('FAIL:', e.message);
    await page.screenshot({ path: 'tmp_candidate_e2e_fail.png', fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
