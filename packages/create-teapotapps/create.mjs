import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { askQuestion, askYesNo, runCommand, startSpinner } from './helpers.mjs';
import { installDatabases } from './installDatabase.mjs';


function generateSecret(length = 48) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
	let secret = '';
	for (let i = 0; i < length; i++) {
		secret += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return secret;
}



function toCamelCase(str) {
	return str
		.replace(/[-_]+/g, ' ')
		.replace(/\s(.)/g, (_, group1) => group1.toUpperCase())
		.replace(/\s/g, '')
		.replace(/^(.)/, (_, group1) => group1.toLowerCase());
}


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function runCreate(args = []) {
	const projectName = args[0] || 'teapotapps';
	const camelCaseName = toCamelCase(projectName);
	const templateDir = path.resolve(__dirname, 'app');
	const targetDir = path.resolve(process.cwd(), projectName);
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

		console.log('✅ Project generated successfully!\n');

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

		const packages = [
			'nodemailer',
			'postgresql',
		];


		const installAll = await askYesNo(
			'📦 Packages to be installed:\n' +
			packages.map(pkg => `  • ${pkg}`).join('\n') +
			'\n❓ Do you want to install all packages?'
		);

		if (installAll === 'y') {
			const mailSpinner = startSpinner('\n✉️ Installing nodemailer');
			await runCommand('npm', ['install', 'nodemailer@^7.0.3'], targetDir);
			clearInterval(mailSpinner);
			process.stdout.write('\r✅ Nodemailer installed successfully!\n');


			const pgSpinner = startSpinner('\n🐘 Installing pg');
			await runCommand('npm', ['install', 'pg@^8.16.3'], targetDir);
			clearInterval(pgSpinner);
			process.stdout.write('\r✅ PostgreSQL installed successfully!\n');

			const hstoreSpinner = startSpinner('\n📦 Installing pg-hstore');
			await runCommand('npm', ['install', 'pg-hstore@^2.3.4'], targetDir);
			clearInterval(hstoreSpinner);
			process.stdout.write('\r✅ pg-hstore installed successfully!\n');
			await installDatabases(args)


		} else if (installAll === "n") {

			const installDatabase = await askYesNo('\n📦 Do you want to be install database?:');

			if (installDatabase === 'y') {
				await installDatabases(args)
			}

		}

		const spinner = startSpinner('\n📦 Installing dependencies');
		await runCommand('npm', ['install'], targetDir);
		clearInterval(spinner);
		process.stdout.write('\r✅ Dependencies installed successfully!\n');

		const authorName = await askQuestion('\n👤 Author name (optional): ');
		const license = await askQuestion('📄 License (default: ISC): ');

		if (Object.keys(pkg).length) {
			pkg.name = camelCaseName; // 🆕 Tambah nama dari folder
			pkg.author = authorName || 'Teapotapps'; // 🆕 Default ke Teapotapps
			pkg.license = license || 'ISC';
			await fs.writeJson(pkgPath, pkg, { spaces: 2 });
			console.log('📝 Successfully updated package.json with name, author, and license');
		}

		if (await fs.pathExists(envExamplePath)) {
			let envContent = await fs.readFile(envExamplePath, 'utf8');
			const accessTokenSecret = generateSecret(45);
			const teaKey = generateSecret(45);

			envContent = envContent
				.replace(/^TEA_NAME=.*$/m, `TEA_NAME=${authorName || 'Teapotapps'}`)
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