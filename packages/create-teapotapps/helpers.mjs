// askYesNo.mjs
import { spawn } from 'child_process';
import readline from 'readline';
import path from 'path';
import fs from 'fs-extra';

export function askYesNo(question) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        const ask = () => {
            rl.question(`${question} [y/n]: `, (answer) => {
                const cleaned = answer.trim().toLowerCase();
                if (cleaned === 'y' || cleaned === 'n') {
                    rl.close();
                    resolve(cleaned);
                } else {
                    console.log('⚠️  Please enter only "y" or "n".');
                    ask(); // repeat
                }
            });
        };

        ask();
    });
}

export function startSpinner(baseMessage, interval = 300) {
    let dotCount = 1;
    const maxDots = 3;

    process.stdout.write('\x1B[?25l');
    process.stdout.write(baseMessage);

    const spinner = setInterval(() => {
        const dots = '.'.repeat(dotCount);

        // Geser cursor ke akhir pesan, lalu tulis ulang titik-titik
        process.stdout.write(`\x1b[s\x1b[${baseMessage.length + 1}G${dots}\x1b[u`);

        dotCount = dotCount % maxDots + 1;
    }, interval);

    return spinner;
}

export function askQuestion(query) {
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

export function runCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, {
            cwd,
            stdio: 'inherit', // tampilkan semua output ke console
            shell: true, // supaya npm bisa jalan di Windows juga (optional tapi disarankan)
        });
        proc.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`${command} exited with code ${code}`));
        });
        proc.on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Buat minimal package.json jika belum ada atau invalid
 * @param {string} projectDir - folder proyek
 * @param {string} projectName - nama proyek (default 'teapotapps')
 */
export async function ensurePackageJson(projectDir, projectName = 'teapotapps') {
    const pkgPath = path.join(projectDir, 'package.json');
    try {
        const pkgRaw = await fs.readFile(pkgPath, 'utf-8');
        JSON.parse(pkgRaw); // Cek valid JSON
    } catch {
        // Kalau file ga ada atau invalid, bikin minimal package.json
        const minimalPkg = {
            name: projectName,
            version: '1.0.0',
            type: 'module',
            dependencies: {}
        };
        await fs.writeFile(pkgPath, JSON.stringify(minimalPkg, null, 2), 'utf-8');
        console.log('✅ Created minimal package.json');
    }
}



export async function addDependency(projectDir, packageName, version) {
    const pkgPath = path.join(projectDir, 'package.json');
    const pkgRaw = await fs.readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(pkgRaw);
    if (Object.keys(pkg).length) {
        pkg.dependencies = pkg.dependencies || {};
        pkg.dependencies[packageName] = version;
        await fs.writeJson(pkgPath, pkg, { spaces: 2 });
        console.log(`✅ Added ${packageName}@${version} to package.json dependencies`);
    }
}
