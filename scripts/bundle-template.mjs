import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path
const apps = path.resolve(__dirname, '../packages/app');
const source = path.resolve(__dirname, '../packages/create-teapotapps');
const target = path.resolve(__dirname, '../packages/teapotapps');

const targetApp = path.resolve(__dirname, '../packages/teapotapps/app');


// Path README dari root
const readmeSource = path.resolve(__dirname, '../README.md');
const readmeTarget = path.join(target, 'README.md');

console.log(`📦 Copying API template to CLI...`);

await fs.remove(target);
await fs.copy(source, target, {
  filter: (src) => !src.includes('node_modules') && !src.includes('.git')
});

// Tambahkan README.md ke packages/teapotapps
await fs.copyFile(readmeSource, readmeTarget);

await fs.copy(apps, targetApp);

console.log('✅ Template copied to CLI for publish (README.md included)');
