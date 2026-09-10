import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { askQuestion, runCommand, startSpinner } from './helpers.mjs';
import { installDatabases, DB_CONFIGS } from './installDatabase.mjs';
import { installMailer } from './installMailer.mjs';
import inquirer from 'inquirer';
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
	const templateDir = (await fs.pathExists(path.resolve(__dirname, 'templates', 'base')))
		? path.resolve(__dirname, 'templates', 'base')
		: path.resolve(__dirname, '../app');
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
		const license = await askQuestion('📄 License (default: ISC): ');

		const { selectedFeatures } = await inquirer.prompt([
			{
				type: 'checkbox',
				name: 'selectedFeatures',
				message: '📦 Select features and configurations to include:',
				choices: [
					{
						name: '[All Packages]  : Everything (Database + Mailer)',
						value: 'all'
					},
					{
						name: 'Database        : Sequelize ORM (PostgreSQL / MySQL / MariaDB)',
						value: 'database'
					},
					{
						name: 'Mailer          : Nodemailer email service',
						value: 'mailer'
					},
					{
						name: 'Vercel Ready    : Serverless configuration (vercel.json)',
						value: 'vercel'
					}
				]
			}
		]);

		const wantAll = selectedFeatures.includes('all');
		const wantDatabase = wantAll || selectedFeatures.includes('database');
		const wantMailer = wantAll || selectedFeatures.includes('mailer');
		const wantVercel = selectedFeatures.includes('vercel');

		let chosenDbEngine = null;
		if (wantDatabase) {
			const { dbEngine } = await inquirer.prompt([
				{
					type: 'list',
					name: 'dbEngine',
					message: '🗄️  Which database engine do you want to use?',
					choices: [
						{ name: 'PostgreSQL (pg + pg-hstore)', value: 'postgresql' },
						{ name: 'MySQL (mysql2)', value: 'mysql' },
						{ name: 'MariaDB (mariadb)', value: 'mariadb' }
					]
				}
			]);
			chosenDbEngine = dbEngine;
		}

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

			const dbConnection = (chosenDbEngine && DB_CONFIGS[chosenDbEngine])
				? DB_CONFIGS[chosenDbEngine].connection
				: '';
			const dbPort = (chosenDbEngine && DB_CONFIGS[chosenDbEngine])
				? DB_CONFIGS[chosenDbEngine].port
				: '';

			envContent = envContent
				.replace(/^APP_NAME=.*$/m, `APP_NAME=${projectName}`)
				.replace(/^APP_ACCESS_TOKEN_SECRET=.*$/m, `APP_ACCESS_TOKEN_SECRET='${accessTokenSecret}'`)
				.replace(/^APP_HOST=.*$/m, `APP_HOST='0.0.0.0'`)
				.replace(/^APP_PORT=.*$/m, `APP_PORT=3010`)
				.replace(/^APP_KEY=.*$/m, `APP_KEY='${key}'`)
				.replace(/^APP_DB_CONNECTION=.*$/m, `APP_DB_CONNECTION=${dbConnection}`)
				.replace(/^APP_DB_PORT=.*$/m, `APP_DB_PORT=${dbPort}`);

			await fs.writeFile(envPath, envContent);
			console.log('\n📄 .env file generated successfully');
		} else {
			console.warn('\n⚠️  .env cannot be generated');
		}

		const subArgs = [isCurrentDir ? '.' : projectName];

		if (wantDatabase && chosenDbEngine) {
			await installDatabases(subArgs, chosenDbEngine);
		}

		if (wantMailer) {
			await installMailer(subArgs);
		}

		if (wantVercel) {
			const vercelConfig = {
				version: 2,
				builds: [
					{
						src: "index.js",
						use: "@vercel/node"
					}
				],
				routes: [
					{
						src: "/(.*)",
						dest: "index.js"
					}
				]
			};
			const vercelPath = path.join(targetDir, 'vercel.json');
			await fs.writeJson(vercelPath, vercelConfig, { spaces: 2 });
			console.log('\n▲ Generated vercel.json for Vercel deployment');
		}

		const spinner = startSpinner('\n📦 Installing dependencies');
		await runCommand('npm', ['install'], targetDir);
		clearInterval(spinner);
		process.stdout.write('\r✅ Dependencies installed successfully!\n');

		console.log('\n🎉 All set!');
		if (!isCurrentDir) {
			console.log(`👉  cd ${projectName}`);
		}
		console.log('👉  npm run dev');
		console.log('👉  http://localhost:3010\n');

		if (wantVercel) {
			console.log('▲ Vercel deployment:');
			console.log('👉  npx vercel\n');
			if (wantDatabase) {
				console.log('💡 Tip: For serverless deployment on Vercel with database, use a cloud database provider with connection pooling (e.g. Supabase, Neon, or PlanetScale).\n');
			}
		}

	} catch (err) {
		if (err.name === 'ExitPromptError' || err.message?.includes('SIGINT') || err.message?.includes('force closed')) {
			console.log('\n❌ Setup cancelled by user. Exiting...');
			process.exit(0);
		}
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