import { chromium } from 'playwright';

const URL = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await page.goto(`${URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await page.click('button:has-text("Candidato")');
    await page.waitForTimeout(500);

    await page.fill('input[type="email"]', 'candidato.diag@test.local');
    await page.fill('input[type="password"]', 'TesteDiag123!');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(10000);

    console.log('3) wait for dashboard');
    await page.waitForSelector('text=/Complete|Área do Candidato|candidato/i', { timeout: 30000 });
    await page.waitForTimeout(4000);

    console.log('1) Navigate to profile page');
    await page.goto(`${URL}/candidato/perfil`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    console.log('2) Fill personal data');
    await page.click('button:first-of-type');
    await page.waitForTimeout(1000);
    const inputs = await page.locator('input[type="text"]:visible, input[type="email"]:visible').all();
    if (inputs.length > 0) {
      await inputs[0].fill('João da Silva');
    }
    if (inputs.length > 1) {
      await inputs[1].fill('candidato.diag@test.local');
    }
    if (inputs.length > 2) {
      await inputs[2].fill('11999999999');
    }
    if (inputs.length > 3) {
      await inputs[3].fill('Desenvolvedor Full Stack experiente');
    }
    await page.click('button:last-of-type');
    await page.waitForTimeout(2000);

    console.log('5) Navigate to resume page');
    await page.goto(`${URL}/candidato/curriculo`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    console.log('6) Add experience');
    await page.click('button:has-text("Adicionar"), button:has-text("Nova")');
    await page.waitForTimeout(1000);
    await page.fill('input[name="position"], input[placeholder*="Cargo"]', 'Desenvolvedor');
    await page.fill('input[name="company"], input[placeholder*="Empresa"]', 'Tech Corp');
    await page.fill('input[name="startDate"], input[placeholder*="Início"]', '01/01/2020');
    await page.fill('input[name="description"], textarea[placeholder*="Descrição"]', 'Desenvolvimento de aplicações web');
    await page.click('button:last-of-type');
    await page.waitForTimeout(2000);

    console.log('7) Add education');
    await page.click('button:has-text("Adicionar"), button:has-text("Nova")');
    await page.waitForTimeout(1000);
    await page.fill('input[name="institution"], input[placeholder*="Instituição"]', 'Universidade Teste');
    await page.fill('input[name="course"], input[placeholder*="Curso"]', 'Ciência da Computação');
    await page.fill('input[name="startDate"], input[placeholder*="Início"]', '01/01/2015');
    await page.fill('input[name="endDate"], input[placeholder*="Conclusão"]', '01/01/2019');
    await page.click('button:last-of-type');
    await page.waitForTimeout(2000);

    console.log('8) Add skill');
    await page.click('button:has-text("Adicionar"), button:has-text("Nova")');
    await page.waitForTimeout(1000);
    await page.fill('input[name="name"], input[placeholder*="Habilidade"]', 'JavaScript');
    await page.selectOption('select[name="level"], select[aria-label*="Nível"]', 'advanced');
    await page.click('button:last-of-type');
    await page.waitForTimeout(2000);

    console.log('9) Add document');
    await page.click('button:has-text("Adicionar"), button:has-text("Novo")');
    await page.waitForTimeout(1000);
    await page.fill('input[name="name"], input[placeholder*="Nome"]', 'Currículo');
    await page.click('button:last-of-type');
    await page.waitForTimeout(2000);

    console.log('10) Check completion percentage');
    const percentText = await page.locator('text=/\\d+%/').first().innerText().catch(() => 'N/A');
    console.log('Percent after filling all fields:', percentText);

    console.log('11) Go to dashboard and verify 100%');
    await page.goto(`${URL}/candidato`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const dashboardPercent = await page.locator('text=/\\d+%/').first().innerText().catch(() => 'N/A');
    console.log('Dashboard percent:', dashboardPercent);

    console.log('12) F5 reload on dashboard');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(4000);

    const reloadedPercent = await page.locator('text=/\\d+%/').first().innerText().catch(() => 'N/A');
    const reloadedPercentNum = String(reloadedPercent).replace('%','').trim();
    const dashboardPercentNum = String(dashboardPercent).replace('%','').trim();

    console.log('Percent after F5:', reloadedPercent);

    if (reloadedPercentNum === dashboardPercentNum && reloadedPercentNum === '100') {
      console.log('SUCCESS — 100% completion persisted after reload');
    } else {
      console.log('WARN — completion may not have reached or persisted correctly');
    }

    console.log('DONE');
  } catch (e) {
    console.error('FAIL:', e.message);
    await page.screenshot({ path: 'tmp_candidate_full_crud_fail.png', fullPage: true }).catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
