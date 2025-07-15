// askYesNo.mjs
import { spawn } from 'child_process';
import readline from 'readline';

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
            stdio: ['ignore', 'ignore', 'inherit'],
        });
        proc.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`${command} exited with code ${code}`));
        });
    });
}