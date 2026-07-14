import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function globalSetup(config: FullConfig) {
  const storagePath = path.join(__dirname, '..', '.auth', 'user.json');
  fs.mkdirSync(path.dirname(storagePath), { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:5173/login');
  await page.getByLabel(/Tên đăng nhập hoặc Email/i).fill(process.env.PLAYWRIGHT_USERNAME || 'doantruongduy8');
  await page.getByLabel(/Mật khẩu/i).fill(process.env.PLAYWRIGHT_PASSWORD || '123456');
  await page.getByRole('button', { name: /Đăng Nhập/i }).click();
  await page.waitForURL(/dashboard|admin\/dashboard/, { timeout: 15000 });
  await context.storageState({ path: storagePath });
  await browser.close();
}

export default globalSetup;
