import { test as base, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storagePath = path.join(__dirname, '..', '..', '.auth', 'user.json');

export const test = base.extend({
  storageState: async ({}, use) => {
    if (fs.existsSync(storagePath)) {
      await use(storagePath);
      return;
    }

    await use(storagePath);
  },
});

export { expect } from '@playwright/test';
