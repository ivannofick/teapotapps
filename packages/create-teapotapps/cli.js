#!/usr/bin/env node
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);

// Handle --version or -v
if (args.includes('--version') || args.includes('-v')) {
  const pkgPath = path.resolve(__dirname, '../app', 'package.json');
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    console.log(`🫖 TeapotApps v${pkg.version}`);
  } catch {
    console.log('🫖 TeapotApps (version unknown)');
  }
  process.exit(0);
}

const cmd = args[0] || 'help';
const cmdFile = pathToFileURL(path.join(__dirname, `${cmd}.mjs`)).href;

try {
  const module = await import(cmdFile);
  if (typeof module.default === 'function') {
    await module.default(args.slice(1));
  }
} catch (err) {
  console.error(`❌ Unknown command: ${cmd}`);
  process.exit(1);
}
