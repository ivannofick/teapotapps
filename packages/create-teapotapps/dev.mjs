import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

export default async function runDev() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rootDir = path.resolve(__dirname, '../app');
  const entryFile = path.resolve(rootDir, 'index.js');

  const runner = hasNodemon() ? 'nodemon' : 'node';
  const args = [entryFile];

  console.log(`🚀 Starting app with ${runner}...\n`);

  const proc = spawn(runner, args, {
    stdio: 'inherit'
  });

  proc.on('close', code => {
    process.exit(code);
  });
}

function hasNodemon() {
  try {
    require.resolve('nodemon');
    return true;
  } catch {
    return false;
  }
}
