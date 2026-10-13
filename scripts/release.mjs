import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const runtimePkgDir = path.join(rootDir, 'packages/teapotapps');
const runtimePkgPath = path.join(runtimePkgDir, 'package.json');

const cliPkgDir = path.join(rootDir, 'packages/create-teapotapps');
const cliPkgPath = path.join(cliPkgDir, 'package.json');

const appPkgPath = path.join(rootDir, 'packages/app/package.json');
const rootPkgPath = path.join(rootDir, 'package.json');

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

async function checkNpmAuth() {
  try {
    const user = execSync('npm whoami', { encoding: 'utf8' }).trim();
    console.log(`👤 Logged in to NPM as: ${user}\n`);
    return user;
  } catch {
    console.error('❌ NPM Authentication Error: You are not logged in to NPM (or session expired).');
    console.error('👉 Please run "npm login" in your terminal first before publishing.\n');
    return null;
  }
}

async function updateVersions(newVersion) {
  // 1. Runtime framework package
  if (await fs.pathExists(runtimePkgPath)) {
    const runtimePkg = await fs.readJson(runtimePkgPath);
    runtimePkg.version = newVersion;
    await fs.writeJson(runtimePkgPath, runtimePkg, { spaces: 2 });
  }

  // 2. CLI scaffolder package
  if (await fs.pathExists(cliPkgPath)) {
    const cliPkg = await fs.readJson(cliPkgPath);
    cliPkg.version = newVersion;
    await fs.writeJson(cliPkgPath, cliPkg, { spaces: 2 });
  }

  // 3. Template package (update teapotapps dependency)
  if (await fs.pathExists(appPkgPath)) {
    const appPkg = await fs.readJson(appPkgPath);
    if (!appPkg.dependencies) appPkg.dependencies = {};
    appPkg.dependencies['teapotapps'] = `^${newVersion}`;
    await fs.writeJson(appPkgPath, appPkg, { spaces: 2 });
  }

  // 4. Workspace root package
  if (await fs.pathExists(rootPkgPath)) {
    const rootPkg = await fs.readJson(rootPkgPath);
    rootPkg.version = newVersion;
    await fs.writeJson(rootPkgPath, rootPkg, { spaces: 2 });
  }
}

async function main() {
  console.log('🫖 TeapotApps One-Command Release Pipeline\n');
  console.log('Synchronizing:');
  console.log('  • Runtime Framework : packages/teapotapps');
  console.log('  • CLI Scaffolder    : packages/create-teapotapps');
  console.log('  • Starter Template  : packages/app\n');

  const npmUser = await checkNpmAuth();
  if (!npmUser) {
    process.exit(1);
  }

  const basePkgPath = (await fs.pathExists(runtimePkgPath)) ? runtimePkgPath : cliPkgPath;
  const basePkg = await fs.readJson(basePkgPath);
  const currentVersion = basePkg.version || '1.0.3';
  const { major, minor, patch } = parseSemver(currentVersion);

  const nextPatch = `${major}.${minor}.${patch + 1}`;
  const nextMinor = `${major}.${minor + 1}.0`;
  const nextDev = `${currentVersion.includes('-dev.') ? currentVersion.replace(/-dev\.(\d+)/, (_, n) => `-dev.${Number(n) + 1}`) : `${nextPatch}-dev.1`}`;

  console.log(`Current version: ${currentVersion}`);
  console.log(`Suggested versions:`);
  console.log(`  1) Patch:       ${nextPatch}`);
  console.log(`  2) Minor:       ${nextMinor}`);
  console.log(`  3) Prerelease:  ${nextDev}`);
  console.log(`  Or type any custom version directly (e.g. 1.0.4-beta.1)\n`);

  const choice = await askQuestion('Select option [1/2/3] or type version directly (default: 1): ');

  let newVersion = nextPatch;
  if (choice === '1' || choice === '') newVersion = nextPatch;
  else if (choice === '2') newVersion = nextMinor;
  else if (choice === '3') newVersion = nextDev;
  else if (choice) newVersion = choice;

  console.log(`\n📝 Updating versions across all packages to ${newVersion}...`);
  await updateVersions(newVersion);

  // Bundle app template with new versions
  console.log('\n📦 Bundling app template...');
  execSync('node scripts/bundle-template.mjs', { cwd: rootDir, stdio: 'inherit' });

  const confirmPublish = await askQuestion(
    `\n🚀 Ready to publish BOTH 'teapotapps@${newVersion}' (runtime) and 'create-teapotapps@${newVersion}' (CLI) to NPM? (y/n): `
  );

  if (confirmPublish.toLowerCase() === 'y') {
    try {
      // 1. Publish runtime package first so CLI dependencies resolve cleanly
      console.log(`\n📡 [1/2] Publishing runtime framework 'teapotapps@${newVersion}'...`);
      execSync('npm publish --access public', { cwd: runtimePkgDir, stdio: 'inherit' });
      console.log(`✅ Successfully published teapotapps@${newVersion}`);

      // 2. Publish CLI package
      console.log(`\n📡 [2/2] Publishing CLI scaffolder 'create-teapotapps@${newVersion}'...`);
      execSync('npm publish --access public', { cwd: cliPkgDir, stdio: 'inherit' });
      console.log(`✅ Successfully published create-teapotapps@${newVersion}`);

      console.log(`\n🎉 SUCCESS! All packages live with synchronized version ${newVersion}:`);
      console.log(`  • Framework Runtime : npm install teapotapps@latest`);
      console.log(`  • Starter Scaffolder: npm create teapotapps@latest my-app`);
      console.log(`  • Direct NPX Runner : npx create-teapotapps my-app\n`);
    } catch (err) {
      console.error('\n❌ Publish error encountered:', err.message);
      process.exit(1);
    }
  } else {
    console.log(`\n⚠️  Publish skipped. Package versions updated to ${newVersion} locally.`);
  }
}

main().catch(err => {
  console.error('❌ Release error:', err);
  process.exit(1);
});
