#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);

if (args.includes('--version') || args.includes('-v')) {
  const pkgPath = path.join(__dirname, 'package.json');
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    console.log(`🫖 TeapotApps v${pkg.version}`);
  } catch {
    console.log('🫖 TeapotApps (version unknown)');
  }
  process.exit(0);
}

const knownCommands = ['create', 'help', 'dev', 'generate', 'brew'];
const [firstArg, ...restArgs] = args;

let cmd = 'create';
let cmdArgs = args;

if (args.includes('--help') || args.includes('-h')) {
  cmd = 'help';
  cmdArgs = [];
} else if (knownCommands.includes(firstArg)) {
  cmd = firstArg;
  cmdArgs = restArgs;
}

const cmdFile = path.join(__dirname, `${cmd}.mjs`);
const cmdUrl = new URL(`file://${cmdFile}`);

try {
  const module = await import(cmdUrl.href);
  if (typeof module.default === 'function') {
    await module.default(cmdArgs);
  }
} catch (err) {
  console.error(`❌ Unknown command: ${cmd}`, err);
  process.exit(1);
}
