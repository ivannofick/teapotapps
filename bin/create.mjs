import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import readline from 'readline';

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

function generateSecret(length = 48) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

function startSpinner(message, maxDots = 500000, interval = 100) {
  let dots = '';
  process.stdout.write(`${message}`);

  const spinner = setInterval(() => {
    dots += '.';
    if (dots.length > maxDots) dots = '.';
    process.stdout.write(`\r${message}${dots} `);
  }, interval);

  return spinner;
}


function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: ['ignore', 'ignore', 'inherit'],
    });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function runCreate(args = []) {
  const projectName = args[0] || 'teapotapps';
  const templateDir = path.resolve(__dirname, '..');
  const targetDir = path.resolve(process.cwd(), projectName);
  const exclude = ['bin', 'node_modules', '.git', 'package-lock.json', 'yarn.lock', '.DS_Store'];
  console.log(`
                       .
                        \`:.
                          \`:.
                  .:'     ,::
                 .:'      ;:'
                 ::      ;:'
                  :    .:'
                   \`.  :.
          _________________________
         : _ _ _ _ _ _ _ _ _ _ _ _ :
     ,---:".".".".".".".".".".".".":
    : ,'"\`::.:.:.:.:.:.:.:.:.:.:.::'
    \`.\`.  \`:-===-===-===-===-===-:'
      \`.\`-._:                   :
        \`-.__\`.               ,'
    ,--------\`"\`-------------'--------.
     \`"--.__                   __.--"\`
            \`""-------------""'

    🫖 TeapotApps: slowly steeped, quickly served.
`);


  console.log(`\n🚀 Creating TeapotApp in: ${targetDir}\n`);

  try {
    await fs.copy(templateDir, targetDir, {
      filter: (src) => {
        const relative = path.relative(templateDir, src);
        if (!relative) return true;
        return !exclude.some(name => relative === name || relative.startsWith(`${name}/`));
      }
    });

    console.log('✅ Project generated successfully!');

    const envExamplePath = path.join(targetDir, 'env.example');
    const envPath = path.join(targetDir, '.env');

    const pkgPath = path.join(targetDir, 'package.json');
    let pkg = {};
    if (await fs.pathExists(pkgPath)) {
      pkg = await fs.readJson(pkgPath);
      delete pkg.bin;
      if (pkg.dependencies?.['fs-extra']) {
        delete pkg.dependencies['fs-extra'];
      }
    }

    const spinner = startSpinner('\n📦 Installing dependencies');
    await runCommand('npm', ['install'], targetDir);
    clearInterval(spinner);
    process.stdout.write('\r✅ Dependencies installed successfully!\n');

    const mailerAnswer = (await askQuestion('\n❓ Do you want to install nodemailer? (Y/n): ')).toLowerCase();
    if (mailerAnswer === 'y' || mailerAnswer === '') {
      const mailSpinner = startSpinner('\n✉️ Installing nodemailer');
      await runCommand('npm', ['install', 'nodemailer'], targetDir);
      clearInterval(mailSpinner);
      process.stdout.write('\r✅ Nodemailer installed successfully!\n');
    }

    const authorName = await askQuestion('\n👤 Author name (optional): ');
    const license = await askQuestion('📄 License (default: ISC): ');

    if (Object.keys(pkg).length) {
      if (authorName) pkg.author = authorName;
      pkg.license = license || 'ISC';
      await fs.writeJson(pkgPath, pkg, { spaces: 2 });
      console.log('📝 Successfully added author and license on package.json');
    }

    if (await fs.pathExists(envExamplePath)) {
      let envContent = await fs.readFile(envExamplePath, 'utf8');
      const accessTokenSecret = generateSecret(45);
      const teaKey = generateSecret(45);

      envContent = envContent
        .replace(/^TEA_NAME=.*$/m, `TEA_NAME=${authorName || 'TeapotApps'}`)
        .replace(/^TEA_ACCESS_TOKEN_SECRET=.*$/m, `TEA_ACCESS_TOKEN_SECRET='${accessTokenSecret}'`)
        .replace(/^TEA_HOST=.*$/m, `TEA_HOST='0.0.0.0'`)
        .replace(/^TEA_PORT=.*$/m, `TEA_PORT=3010`)
        .replace(/^TEA_KEY=.*$/m, `TEA_KEY='${teaKey}'`);

      await fs.writeFile(envPath, envContent);
      console.log('📄 .env file generated successfully');
    } else {
      console.warn('⚠️  .env cannot be generated');
    }

    console.log('\n🎉 All set!');
    console.log(`👉  cd ${projectName}`);
    console.log('👉  npm run dev\n');
    console.log('👉  http://localhost:3000\n');

  } catch (err) {
    console.error('❌ Failed to create project:', err);
    process.exit(1);
  }
}
