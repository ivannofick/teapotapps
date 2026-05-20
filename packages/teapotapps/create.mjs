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
	try {
		const testRes = await fetch('https://raw.githubusercontent.com/');
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
		if (!testRes.ok) throw new Error('❌ Unable to fetch the tea leaves (resources)');
	} catch (err) {
		throw new Error('❌ No internet connection — the teapot cannot be brewed!');
	}

	const nameApps = args[0] != '.' || !args[0] ? args[0] : 'teapotapps';
	const projectName = nameApps;
	const camelCaseName = toCamelCase(projectName);
	const templateDir = path.resolve(__dirname, 'app');
	const targetDir = path.resolve(process.cwd(), args[0] || 'teapotapps');
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
			pkg.name = camelCaseName; // 🆕 Tambah nama dari folder
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
				.replace(/^APP_NAME=.*$/m, `APP_NAME=${nameApps}`)
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

		if (installAll === 'y') {
			await installMailer(args)
			await installDatabases(args)
		} else if (installAll === "n") {

			const installDatabase = await askYesNo('\n📦 Do you want to be install database?:');

			if (installDatabase === 'y') {
				await installDatabases(args)
			}
			const askMailer = await askYesNo('\n📦 Would you like to install the mailer?:');

			if (askMailer === 'y') {
				await installMailer(args)

			}
		}
		const spinner = startSpinner('\n📦 Installing dependencies');
		await runCommand('npm', ['install'], targetDir);
		clearInterval(spinner);
		process.stdout.write('\r✅ Dependencies installed successfully!\n');

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