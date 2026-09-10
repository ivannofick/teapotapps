import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { askQuestion, askYesNo, runCommand, startSpinner } from './helpers.mjs';
import { installDatabases } from './installDatabase.mjs';
import { installMailer } from './installMailer.mjs';
import fetch from 'node-fetch';


function generateSecret(length = 48) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charsLength = chars.length;

	const timestampPart = Date.now().toString(36);
	const randomLength = length - timestampPart.length;
	let randomPart = '';
	for (let i = 0; i < randomLength; i++) {
		const randomIndex = Math.floor(Math.random() * charsLength);
		randomPart += chars.charAt(randomIndex);
	}

	return timestampPart + randomPart;
}


function sanitizePackageName(str = 'teapotapps') {
	return str
		.trim()
		.toLowerCase()
		.replace(/[\s_]+/g, '-')
		.replace(/[^a-z0-9-~]/g, '')
		.replace(/^-+|-+$/g, '') || 'teapotapps';
}


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function runCreate(args = []) {
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
  
			\n🫖 Your teapot is warm, time to brew your app 🚀
	`);

	try {
		const testRes = await fetch('https://registry.npmjs.org', { signal: AbortSignal.timeout(3000) });
		if (!testRes.ok) {
			console.warn('⚠️  Warning: Unable to reach npm registry. Offline mode will be used.');
		}
	} catch {
		console.warn('⚠️  Warning: No internet connection detected. Continuing offline...');
	}

	const rawArg = typeof args[0] === 'string' ? args[0].trim() : '';
	const isCurrentDir = rawArg === '.';
	const projectName = isCurrentDir
		? path.basename(process.cwd())
		: (rawArg || 'teapotapps');
	const packageName = sanitizePackageName(projectName);
	const templateDir = (await fs.pathExists(path.resolve(__dirname, 'template')))
		? path.resolve(__dirname, 'template')
		: path.resolve(__dirname, 'app');
	const targetDir = isCurrentDir
		? process.cwd()
		: path.resolve(process.cwd(), projectName);
	const exclude = ['bin', 'node_modules', '.git', 'package-lock.json', 'yarn.lock', '.DS_Store'];

	console.log(`\n🚀 Creating TeapotApp in: ${targetDir}\n`);

	try {
		await fs.copy(templateDir, targetDir, {
			filter: (src) => {
				const relative = path.relative(templateDir, src);
				if (!relative) return true;
				return !exclude.some(name => relative === name || relative.startsWith(`${name}/`));
			}
		});

		// Rename _gitignore to .gitignore
		const bundledGitignore = path.join(targetDir, '_gitignore');
		const targetGitignore = path.join(targetDir, '.gitignore');
		if (await fs.pathExists(bundledGitignore)) {
			await fs.move(bundledGitignore, targetGitignore, { overwrite: true });
		}

		console.log('\n✅ Project generated successfully!');

		const envExamplePath = path.join(targetDir, 'env.example');
		const envPath = path.join(targetDir, '.env');

		const pkgPath = path.join(targetDir, 'package.json');
		let pkg = {};
		if (await fs.pathExists(pkgPath)) {
			pkg = await fs.readJson(pkgPath);
			delete pkg.bin;
			delete pkg.inquirer;
			if (pkg.dependencies?.['fs-extra']) {
				delete pkg.dependencies['fs-extra'];
			}
		}

		const authorName = await askQuestion('\n👤 Author name (optional): ');

		const license = await askQuestion('\n📄 License (default: ISC): ');
		if (Object.keys(pkg).length) {
			pkg.name = packageName; // 🆕 Nama valid sesuai aturan NPM
			pkg.author = authorName || 'Teapotapps'; // 🆕 Default ke Teapotapps
			pkg.license = license || 'ISC';
			await fs.writeJson(pkgPath, pkg, { spaces: 2 });
			console.log('\n📝 Successfully updated package.json with name, author, and license');
		}

		if (await fs.pathExists(envExamplePath)) {
			let envContent = await fs.readFile(envExamplePath, 'utf8');
			const accessTokenSecret = generateSecret(45);
			const key = generateSecret(45);

			envContent = envContent
				.replace(/^APP_NAME=.*$/m, `APP_NAME=${projectName}`)
				.replace(/^APP_ACCESS_TOKEN_SECRET=.*$/m, `APP_ACCESS_TOKEN_SECRET='${accessTokenSecret}'`)
				.replace(/^APP_HOST=.*$/m, `APP_HOST='0.0.0.0'`)
				.replace(/^APP_PORT=.*$/m, `APP_PORT=3010`)
				.replace(/^APP_KEY=.*$/m, `APP_KEY='${key}'`);

			await fs.writeFile(envPath, envContent);
			console.log('\n📄 .env file generated successfully');
		} else {
			console.warn('\n⚠️  .env cannot be generated');
		}


		const packages = [
			'nodemailer',
			'postgresql',
		];
		const installAll = await askYesNo(
			'\n📦 Packages to be installed:\n' +
			packages.map(pkg => `  • ${pkg}`).join('\n') +
			'\n❓ Do you want to install all packages?'
		);

		const subArgs = [isCurrentDir ? '.' : projectName];

		if (installAll === 'y') {
			await installMailer(subArgs);
			await installDatabases(subArgs);
		} else if (installAll === "n") {

			const installDatabase = await askYesNo('\n📦 Do you want to be install database?:');

			if (installDatabase === 'y') {
				await installDatabases(subArgs);
			}
			const askMailer = await askYesNo('\n📦 Would you like to install the mailer?:');

			if (askMailer === 'y') {
				await installMailer(subArgs);

			}
		}
		const spinner = startSpinner('\n📦 Installing dependencies');
		await runCommand('npm', ['install'], targetDir);
		clearInterval(spinner);
		process.stdout.write('\r✅ Dependencies installed successfully!\n');

		console.log('\n🎉 All set!');
		if (!isCurrentDir) {
			console.log(`👉  cd ${projectName}`);
		}
		console.log('👉  npm run dev\n');
		console.log('👉  http://localhost:3010\n');

	} catch (err) {
		console.error('❌ Failed to create project:', err);
		process.exit(1);
	}
}


//  else if (installAll === "n") {
//   const uninstallList = packages.map(pkg => pkg.split('@')[0]);
//   await runCommand('npm', ['uninstall', ...uninstallList], targetDir);
//   if (await fs.pathExists(pkgPath)) {
//     let updated = false;
//     uninstallList.forEach(name => {
//       if (pkg.dependencies?.[name]) {
//         delete pkg.dependencies[name];
//         updated = true;
//       }
//     });
//     if (updated) {
//       await fs.writeJson(pkgPath, pkg, { spaces: 2 });
//     }
//   }
// }