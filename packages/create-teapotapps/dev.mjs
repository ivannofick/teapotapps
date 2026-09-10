import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';

export default async function runDev() {
  const projectDir = process.cwd();
  let entryFile = 'index.js';

  const pkgPath = path.join(projectDir, 'package.json');
  if (await fs.pathExists(pkgPath)) {
    try {
      const pkg = await fs.readJson(pkgPath);
      if (pkg.main) {
        entryFile = pkg.main;
      }
    } catch {
      // ignore invalid json
    }
  }

  const fullEntryPath = path.resolve(projectDir, entryFile);
  if (!(await fs.pathExists(fullEntryPath))) {
    console.error(`❌ Cannot find entry file: ${entryFile} in ${projectDir}`);
    process.exit(1);
  }

  const localNodemon = path.resolve(
    projectDir,
    'node_modules/.bin',
    process.platform === 'win32' ? 'nodemon.cmd' : 'nodemon'
  );
  const hasLocalNodemon = await fs.pathExists(localNodemon);
  const runner = hasLocalNodemon ? localNodemon : 'node';
  const args = [entryFile];

  console.log(`🚀 Starting app with ${hasLocalNodemon ? 'nodemon' : 'node'} (${entryFile})...\n`);

  const proc = spawn(runner, args, {
    cwd: projectDir,
    stdio: 'inherit',
    shell: true
  });

  proc.on('close', code => {
    process.exit(code ?? 0);
  });
}
