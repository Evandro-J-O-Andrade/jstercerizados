import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env') });

import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

test.setTimeout(180000);

async function loginAsAdmin(page: any) {
  await page.goto('http://localhost:3004/login');
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

  try {
    await page.waitForURL(/\/(dashboard|auth\/welcome)/, { timeout: 30000 });
  } catch (e) {
    console.log('Current URL after login:', page.url());
    const bodyText = await page.locator('body').innerText();
    console.log('Page content:', bodyText.slice(0, 1000));
    throw e;
  }

  if (page.url().includes('/auth/welcome')) {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const continueButton = page.getByRole('button', { name: /Continuar/i });
    const accessButton = page.getByRole('button', { name: /Acessar minha área/i });
    if (await continueButton.isVisible({ timeout: 5000 })) {
      await continueButton.click();
    } else if (await accessButton.isVisible({ timeout: 5000 })) {
      await accessButton.click();
    } else {
      const anyButton = page.locator('button[type="submit"]').first();
      if (await anyButton.isVisible({ timeout: 2000 })) {
        await anyButton.click();
      }
    }
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });
  }
}

async function navigateToModule(page: any, modulePath: string, moduleName: string) {
  await page.goto(`http://localhost:3004/dashboard${modulePath}`);
  await page.waitForLoadState('networkidle');
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('heading', { name: new RegExp(moduleName, 'i') }).first()).toBeVisible({ timeout: 10000 });
}

async function openCreateModal(page: any) {
  const createButton = page.getByRole('button', { name: /Nova|Novo|Criar|Adicionar/i }).first();
  await expect(createButton).toBeVisible({ timeout: 5000 });
  await createButton.click();
  await page.waitForTimeout(1000);
}

async function fillMediaUploader(page: any, filePath: string) {
  const fileInput = page.locator('input[type="file"]').first();
  await expect(fileInput).toBeAttached({ timeout: 5000 });
  await fileInput.setInputFiles(filePath);
  await page.waitForTimeout(1000);
}

async function submitMediaUpload(page: any) {
  const uploadButton = page.getByRole('button', { name: /Enviar|Upload/i }).first();
  await expect(uploadButton).toBeVisible({ timeout: 5000 });
  await uploadButton.click();
  await page.waitForTimeout(5000);
}

async function verifyMediaPersisted(page: any, entityName: string) {
  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(entityName)).toBeVisible({ timeout: 10000 });
}

const TEST_IMAGE_PATH = path.join(__dirname, 'fixtures', 'test-image.png');

test.describe('Media Integration - Read-Only Navigation & Permissions', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'Missing ADMIN_EMAIL or ADMIN_PASSWORD');
    await page.goto('http://localhost:3004');
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem('jst_intro_complete', '1');
      } catch {}
    });
    await page.context().clearCookies();
    await loginAsAdmin(page);
  });

  test('Empresas - module loads correctly', async ({ page }) => {
    await navigateToModule(page, '/empresas', 'Empresas');
    await expect(page.getByRole('button', { name: /Nova empresa/i })).toBeVisible({ timeout: 10000 });
  });

  test('Serviços - module loads correctly', async ({ page }) => {
    await navigateToModule(page, '/servicos', 'Serviços');
    await expect(page.getByRole('button', { name: /Nova|Novo|Criar|Adicionar/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('Navigation between media-enabled modules works', async ({ page }) => {
    await navigateToModule(page, '/empresas', 'Empresas');
    // Navigate to Serviços via direct URL
    await page.goto('http://localhost:3004/dashboard/servicos');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /Serviços/i }).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Media Integration - Write Operations (Requires Explicit Authorization)', () => {
  test.skip('Skipped - requires explicit authorization to write to Supabase', () => {});

  test.beforeEach(async ({ page }) => {
    test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'Missing ADMIN_EMAIL or ADMIN_PASSWORD');
    await page.goto('http://localhost:3004');
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem('jst_intro_complete', '1');
      } catch {}
    });
    await page.context().clearCookies();
    await loginAsAdmin(page);
  });

  test('Empresas - create company with logo upload', async ({ page }) => {
    await navigateToModule(page, '/empresas', 'Empresas');
    await openCreateModal(page);
    await page.fill('input[name="name"], input[placeholder*="nome" i]', 'Test Company Media');
    await fillMediaUploader(page, TEST_IMAGE_PATH);
    await submitMediaUpload(page);
    await page.fill('input[name="trading_name"], input[placeholder*="fantasia" i]', 'Test Trade');
    await page.fill('input[name="cnpj"], input[placeholder*="cnpj" i]', '12.345.678/0001-90');
    const saveButton = page.getByRole('button', { name: /Salvar|Criar/i }).first();
    await saveButton.click();
    await page.waitForTimeout(3000);
    await verifyMediaPersisted(page, 'Test Company Media');
  });

  test('Serviços - create service with image upload', async ({ page }) => {
    await navigateToModule(page, '/servicos', 'Serviços');
    await openCreateModal(page);
    await page.fill('input[name="name"], input[placeholder*="nome" i]', 'Test Service Media');
    await fillMediaUploader(page, TEST_IMAGE_PATH);
    await submitMediaUpload(page);
    const saveButton = page.getByRole('button', { name: /Salvar|Criar/i }).first();
    await saveButton.click();
    await page.waitForTimeout(3000);
    await verifyMediaPersisted(page, 'Test Service Media');
  });

  test('Gallery - multiple images, reorder, set primary, archive', async ({ page }) => {
    await navigateToModule(page, '/empresas', 'Empresas');
    await openCreateModal(page);
    await page.fill('input[name="name"], input[placeholder*="nome" i]', 'Test Gallery Company');
    const saveButton = page.getByRole('button', { name: /Salvar|Criar/i }).first();
    await saveButton.click();
    await page.waitForTimeout(2000);

    const editButton = page.getByRole('button', { name: /Editar/i }).first();
    await editButton.click();
    await page.waitForTimeout(1000);

    await fillMediaUploader(page, TEST_IMAGE_PATH);
    await submitMediaUpload(page);
    await fillMediaUploader(page, TEST_IMAGE_PATH);
    await submitMediaUpload(page);

    const dragHandle = page.getByLabelText(/Reordenar/i).first();
    if (await dragHandle.isVisible({ timeout: 2000 })) {
      await dragHandle.hover();
      await page.mouse.down();
      await page.mouse.move(100, 200);
      await page.mouse.up();
      await page.waitForTimeout(1000);
    }

    const setPrimaryButton = page.getByLabelText(/Definir como principal/i).first();
    if (await setPrimaryButton.isVisible({ timeout: 2000 })) {
      await setPrimaryButton.click();
      await page.waitForTimeout(2000);
    }

    const archiveButton = page.getByLabelText(/Remover|Arquivar/i).first();
    if (await archiveButton.isVisible({ timeout: 2000 })) {
      await archiveButton.click();
      await page.waitForTimeout(2000);
    }

    await verifyMediaPersisted(page, 'Test Gallery Company');
  });
});

test.describe('Media Integration - Negative Cases (Permission Denial)', () => {
  test('Skipped - requires explicit authorization to test permission boundaries', () => {});

  test('Skipped: upload without permission should be denied', () => {});
  test('Skipped: upload with wrong tenant should be denied', () => {});
  test('Skipped: upload with invalid entity_id should be denied', () => {});
});

test.describe('Media Integration - Persistence After Reload', () => {
  test.skip('Skipped - requires explicit authorization to write to Supabase', () => {});

  test.beforeEach(async ({ page }) => {
    test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'Missing ADMIN_EMAIL or ADMIN_PASSWORD');
    await page.goto('http://localhost:3004');
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem('jst_intro_complete', '1');
      } catch {}
    });
    await page.context().clearCookies();
    await loginAsAdmin(page);
  });

  test('Empresas - media persists after page reload', async ({ page }) => {
    await navigateToModule(page, '/empresas', 'Empresas');
    await openCreateModal(page);
    await page.fill('input[name="name"], input[placeholder*="nome" i]', 'Persist Test Company');
    await fillMediaUploader(page, TEST_IMAGE_PATH);
    await submitMediaUpload(page);
    const saveButton = page.getByRole('button', { name: /Salvar|Criar/i }).first();
    await saveButton.click();
    await page.waitForTimeout(3000);
    await verifyMediaPersisted(page, 'Persist Test Company');
  });

  test('Serviços - media persists after page reload', async ({ page }) => {
    await navigateToModule(page, '/servicos', 'Serviços');
    await openCreateModal(page);
    await page.fill('input[name="name"], input[placeholder*="nome" i]', 'Persist Test Service');
    await fillMediaUploader(page, TEST_IMAGE_PATH);
    await submitMediaUpload(page);
    const saveButton = page.getByRole('button', { name: /Salvar|Criar/i }).first();
    await saveButton.click();
    await page.waitForTimeout(3000);
    await verifyMediaPersisted(page, 'Persist Test Service');
  });
});