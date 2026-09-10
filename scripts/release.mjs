import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const pkgPath = path.join(rootDir, 'packages/create-teapotapps/package.json');

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve =>
    rl.question(query, answer => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

function parseSemver(version) {
  const clean = version.split('-')[0];
  const [major, minor, patch] = clean.split('.').map(Number);
  return { major: major || 0, minor: minor || 0, patch: patch || 0 };
}

async function main() {
  console.log('🫖 TeapotApps Dual-Release Pipeline (create-teapotapps & teapotapps)\n');

  if (!await fs.pathExists(pkgPath)) {
    console.error(`❌ package.json not found at: ${pkgPath}`);
    process.exit(1);
  }

  const pkg = await fs.readJson(pkgPath);
  const currentVersion = pkg.version;
  const { major, minor, patch } = parseSemver(currentVersion);

  const nextPatch = `${major}.${minor}.${patch + 1}`;
  const nextMinor = `${major}.${minor + 1}.0`;
  const nextDev = `${currentVersion.includes('-dev.') ? currentVersion.replace(/-dev\.(\d+)/, (_, n) => `-dev.${Number(n) + 1}`) : `${nextPatch}-dev.1`}`;

  console.log(`Current version: ${currentVersion}`);
  console.log(`Suggested versions:`);
  console.log(`  1) Patch:       ${nextPatch}`);
  console.log(`  2) Minor:       ${nextMinor}`);
  console.log(`  3) Prerelease:  ${nextDev}`);
  console.log(`  4) Custom version\n`);

  const choice = await askQuestion('Select version option [1/2/3/4] (default: 1): ');

  let newVersion = nextPatch;
  if (choice === '2') newVersion = nextMinor;
  else if (choice === '3') newVersion = nextDev;
  else if (choice === '4') {
    const custom = await askQuestion('Enter custom version: ');
    if (!custom) {
      console.error('❌ Version cannot be empty');
      process.exit(1);
    }
    newVersion = custom;
  }

  // Bundle app template first
  console.log('\n📦 Bundling app template...');
  execSync('node scripts/bundle-template.mjs', { cwd: rootDir, stdio: 'inherit' });

  const confirmPublish = await askQuestion(
    `\n🚀 Ready to publish BOTH 'create-teapotapps@${newVersion}' and 'teapotapps@${newVersion}' to NPM? (y/n): `
  );

  if (confirmPublish.toLowerCase() === 'y') {
    const pkgDir = path.join(rootDir, 'packages/create-teapotapps');

    try {
      // 1. Publish create-teapotapps
      console.log(`\n📡 [1/2] Publishing 'create-teapotapps@${newVersion}'...`);
      pkg.name = 'create-teapotapps';
      pkg.version = newVersion;
      await fs.writeJson(pkgPath, pkg, { spaces: 2 });
      execSync('npm publish --access public', { cwd: pkgDir, stdio: 'inherit' });
      console.log(`✅ Published create-teapotapps@${newVersion}`);

      // 2. Publish teapotapps
      console.log(`\n📡 [2/2] Publishing 'teapotapps@${newVersion}'...`);
      pkg.name = 'teapotapps';
      pkg.version = newVersion;
      await fs.writeJson(pkgPath, pkg, { spaces: 2 });
      execSync('npm publish --access public', { cwd: pkgDir, stdio: 'inherit' });
      console.log(`✅ Published teapotapps@${newVersion}`);

      // Restore default name back to create-teapotapps
      pkg.name = 'create-teapotapps';
      await fs.writeJson(pkgPath, pkg, { spaces: 2 });

      console.log(`\n🎉 SUCCESS! Both packages are now live with synchronized version ${newVersion}:`);
      console.log(`  • npm create teapotapps@latest my-app`);
      console.log(`  • npx create-teapotapps my-app`);
      console.log(`  • teapotapps create my-app (npm i -g teapotapps)`);
      console.log(`  • npx teapotapps create my-app\n`);
    } catch (err) {
      // Ensure restored even on error
      pkg.name = 'create-teapotapps';
      await fs.writeJson(pkgPath, pkg, { spaces: 2 });
      console.error('\n❌ Publish failed:', err.message);
    }
  } else {
    pkg.version = newVersion;
    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    console.log(`\n⚠️  Publish skipped. Package version was updated to ${newVersion} locally.`);
  }
}

main().catch(err => {
  console.error('❌ Release error:', err);
  process.exit(1);
});
