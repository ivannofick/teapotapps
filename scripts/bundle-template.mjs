import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const appSource = path.join(rootDir, 'packages/app');
const targetTemplate = path.join(rootDir, 'packages/create-teapotapps/templates/base');
const readmeSource = path.join(rootDir, 'README.md');
const readmeCliTarget = path.join(rootDir, 'packages/create-teapotapps/README.md');

console.log('📦 Bundling app template for create-teapotapps CLI...');

const excludeList = [
  'node_modules',
  '.git',
  '.env',
  '.DS_Store',
  'package-lock.json',
  'yarn.lock',
  'src/core',
  'src/libs'
];

// Clean previous template bundle
await fs.remove(targetTemplate);
await fs.ensureDir(targetTemplate);

// Copy app template with strict filter
await fs.copy(appSource, targetTemplate, {
  filter: (src) => {
    const relative = path.relative(appSource, src);
    if (!relative) return true;
    return !excludeList.some(excluded => relative === excluded || relative.startsWith(`${excluded}/`));
  }
});

// Keep README in sync with root
if (await fs.pathExists(readmeSource)) {
  await fs.copyFile(readmeSource, readmeCliTarget);
}

console.log('✅ App template successfully bundled into packages/create-teapotapps/templates/base');
