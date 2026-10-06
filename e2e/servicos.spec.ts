import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env') });

import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const BASE_URL = 'http://localhost:3004';

test.setTimeout(180_000);

async function loginAsAdmin(page: any) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  const skipButton = page.getByRole('button', { name: 'Pular' });
  if ((await skipButton.count()) > 0) {
    await skipButton.click();
    await page.waitForLoadState('networkidle');
  }

  const contextButton = page.getByRole('button', { name: 'Admin' });
  if ((await contextButton.count()) > 0) {
    await contextButton.first().click();
    await page.waitForLoadState('networkidle');
  }

  await page
    .locator('input[type="email"], input[type="text"]')
    .first()
    .fill(ADMIN_EMAIL!);
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD!);
  await page.locator('button[type="submit"]').click();

  try {
    await page.waitForURL(/\/(dashboard|auth\/welcome)/, { timeout: 30_000 });
  } catch {
    console.log('LOGIN URL TIMEOUT — current:', page.url());
  }

  if (page.url().includes('/auth/welcome')) {
    const continueButton = page.getByRole('button', {
      name: /Continuar|Acessar minha área/i,
    });
    if (await continueButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForURL(/\/dashboard/, { timeout: 15_000 }).catch(() => {});
    }
  }
}

async function gotoServicos(page: any) {
  await page.goto(`${BASE_URL}/dashboard/servicos`);
  await page.waitForLoadState('networkidle');
  await expect(
    page.getByRole('heading', { name: 'Serviços', level: 1 }).first(),
  ).toBeVisible({ timeout: 20_000 });
}

test.describe('Serviços — E2E read-only (Supabase produção)', () => {
  test('listagem carrega serviços reais do Supabase', async ({ page }) => {
    test.skip(
      !ADMIN_EMAIL || !ADMIN_PASSWORD,
      'Missing ADMIN_EMAIL or ADMIN_PASSWORD',
    );

    await loginAsAdmin(page);
    await gotoServicos(page);

    await expect(page).toHaveURL(/\/dashboard\/servicos/);
    await expect(page.getByText(/Catálogo, ordens e execuções/i)).toBeVisible();

    const sawSpinner = await page
      .locator('.animate-spin')
      .isVisible()
      .catch(() => false);
    console.log('LOADING STATE observed (spinner):', sawSpinner);

    await expect(
      page
        .getByRole('columnheader', { name: 'Nome' })
        .or(page.getByText('Nenhum serviço cadastrado.')),
    ).toBeVisible({ timeout: 20_000 });

    const hasTable = (await page.locator('table').count()) > 0;
    const rowCount = hasTable ? await page.locator('tbody tr').count() : 0;
    console.log('SERVICES TABLE rows:', rowCount);

    if (hasTable) {
      await expect(
        page.getByRole('columnheader', { name: 'Categoria' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Status' }),
      ).toBeVisible();
    } else {
      await expect(page.getByText('Nenhum serviço cadastrado.')).toBeVisible();
    }
  });

  test('aba Ordens carrega ordens reais do Supabase', async ({ page }) => {
    test.skip(
      !ADMIN_EMAIL || !ADMIN_PASSWORD,
      'Missing ADMIN_EMAIL or ADMIN_PASSWORD',
    );

    await loginAsAdmin(page);
    await gotoServicos(page);

    await page.getByRole('button', { name: 'Ordens', exact: true }).click();

    await expect(
      page.getByRole('heading', { name: 'Ordens de Serviço' }),
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page
        .getByRole('columnheader', { name: 'Serviço' })
        .or(page.getByText('Nenhuma ordem registrada.')),
    ).toBeVisible({ timeout: 20_000 });

    const hasTable = (await page.locator('table').count()) > 0;
    console.log(
      'ORDERS TABLE rows:',
      hasTable ? await page.locator('tbody tr').count() : 0,
    );

    if (hasTable) {
      await expect(
        page.getByRole('columnheader', { name: 'Status' }),
      ).toBeVisible();
    } else {
      await expect(page.getByText('Nenhuma ordem registrada.')).toBeVisible();
    }
  });

  test('aba Execuções carrega execuções reais do Supabase', async ({
    page,
  }) => {
    test.skip(
      !ADMIN_EMAIL || !ADMIN_PASSWORD,
      'Missing ADMIN_EMAIL or ADMIN_PASSWORD',
    );

    await loginAsAdmin(page);
    await gotoServicos(page);

    await page.getByRole('button', { name: 'Execuções', exact: true }).click();

    await expect(
      page
        .getByRole('columnheader', { name: 'Ordem' })
        .or(page.getByText('Nenhuma execução registrada.')),
    ).toBeVisible({ timeout: 20_000 });

    const hasTable = (await page.locator('table').count()) > 0;
    console.log(
      'EXECUTIONS TABLE rows:',
      hasTable ? await page.locator('tbody tr').count() : 0,
    );

    if (hasTable) {
      await expect(
        page.getByRole('columnheader', { name: 'Início' }),
      ).toBeVisible();
    } else {
      await expect(
        page.getByText('Nenhuma execução registrada.'),
      ).toBeVisible();
    }
  });

  test('admin master visualiza ações de CRUD sem executá-las (permissões)', async ({
    page,
  }) => {
    test.skip(
      !ADMIN_EMAIL || !ADMIN_PASSWORD,
      'Missing ADMIN_EMAIL or ADMIN_PASSWORD',
    );

    await loginAsAdmin(page);
    await gotoServicos(page);

    await expect(page.getByText(/acesso negado/i)).not.toBeVisible();
    await expect(page.getByText(/página não encontrada/i)).not.toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Novo' }).first(),
    ).toBeVisible({
      timeout: 10_000,
    });

    await expect(page.locator('tbody tr').first()).toBeVisible({
      timeout: 15_000,
    });

    const toggleCount = await page
      .getByRole('button', { name: 'Alternar status' })
      .count();
    const editCount = await page
      .getByRole('button', { name: 'Editar' })
      .count();
    const deleteCount = await page
      .getByRole('button', { name: 'Excluir' })
      .count();
    console.log(
      'PERMISSIONS — Alternar status:',
      toggleCount,
      '| Editar:',
      editCount,
      '| Excluir:',
      deleteCount,
    );

    const hasRows = (await page.locator('tbody tr').count()) > 0;
    if (hasRows) {
      expect(toggleCount).toBeGreaterThan(0);
      expect(editCount).toBeGreaterThan(0);
      expect(deleteCount).toBeGreaterThan(0);
    }

    await expect(page.getByText('Tentar novamente')).not.toBeVisible();
  });

  test('estado de erro quando a API do Supabase falha (read-only)', async ({
    page,
  }) => {
    test.skip(
      !ADMIN_EMAIL || !ADMIN_PASSWORD,
      'Missing ADMIN_EMAIL or ADMIN_PASSWORD',
    );

    await loginAsAdmin(page);

    await page.route('**/rest/v1/services*', (route) => route.abort());

    await page.goto(`${BASE_URL}/dashboard/servicos`);
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Serviços', level: 1 }).first(),
    ).toBeVisible({ timeout: 20_000 });

    await expect(
      page.getByRole('button', { name: 'Tentar novamente' }),
    ).toBeVisible({
      timeout: 20_000,
    });

    await page.unroute('**/rest/v1/services*');
  });

  test('catálogo público /servicos é legível sem autenticação', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/servicos`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/página não encontrada/i)).not.toBeVisible({
      timeout: 10_000,
    });

    const mainText = await page.locator('main, body').first().innerText();
    console.log('PUBLIC /servicos text length:', mainText.length);
    expect(mainText.length).toBeGreaterThan(0);
  });
});
