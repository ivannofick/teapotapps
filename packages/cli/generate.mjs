import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultEnvTemplate = `TEA_NAME=TeapotApps
TEA_PORT=3010
TEA_HOST='0.0.0.0'
TEA_FRONTEND=
TEA_ACCESS_TOKEN_SECRET=
TEA_KEY=
TEA_DB_CONNECTION=
TEA_DB_HOST=
TEA_DB_PORT=
TEA_DB_DATABASE=
TEA_DB_USERNAME=
TEA_DB_PASSWORD=
TEA_MAIL_DRIVER=
TEA_MAIL_HOST=
TEA_MAIL_PORT=
TEA_MAIL_USERNAME=
TEA_MAIL_PASSWORD=
TEA_MAIL_ENCRYPTION=
`;

export default async function runGenerate(args = []) {
    const inputKey = args[0];
    const envPath = path.resolve(process.cwd(), '.env');

    if (inputKey === 'ALL') {
        let envExists = await fs.pathExists(envPath);

        if (!envExists) {
            await fs.writeFile(envPath, defaultEnvTemplate.trim() + '\n', 'utf8');
            console.log('📄 .env created with default template');
            return;
        }

        let envContent = await fs.readFile(envPath, 'utf8');

        const parsed = parseEnv(envContent);
        const allEmpty = Object.values(parsed).every(value => value === '');

        if (allEmpty) {
            // Only fill in the defaults
            parsed['TEA_NAME'] = 'TeapotApps';
            parsed['TEA_PORT'] = '3010';
            parsed['TEA_HOST'] = `'0.0.0.0'`;
            const updated = Object.entries(parsed).map(([k, v]) => `${k}=${v}`).join('\n');
            await fs.writeFile(envPath, updated.trim() + '\n', 'utf8');
            console.log('📄 .env updated with minimal default values');
            return;
        }

        console.log('✅ .env already has content. No changes made.');
        return;
    }

    // -- Single Key Generate --
    if (!inputKey || !/^[A-Z0-9_]+$/.test(inputKey)) {
        console.error('❌ Please provide a valid environment key name in UPPERCASE format.');
        process.exit(1);
    }

    const newValue = `'${generateSecret(48)}'`;

    try {
        let envContent = '';
        if (await fs.pathExists(envPath)) {
            envContent = await fs.readFile(envPath, 'utf8');
        }

        const regex = new RegExp(`^${inputKey}=.*$`, 'm');
        if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `${inputKey}=${newValue}`);
            console.log(`🔁 Replaced existing ${inputKey} in .env`);
        } else {
            envContent += `\n${inputKey}=${newValue}`;
            console.log(`➕ Appended ${inputKey} to .env`);
        }

        await fs.writeFile(envPath, envContent.trim() + '\n', 'utf8');
        console.log(`✅ Successfully updated .env with ${inputKey}`);
    } catch (err) {
        console.error('❌ Failed to update .env:', err.message);
        process.exit(1);
    }
}

function parseEnv(content) {
    const lines = content.split(/\r?\n/);
    const result = {};

    for (const line of lines) {
        if (!line || line.trim().startsWith('#')) continue;
        const [key, ...valParts] = line.split('=');
        const val = valParts.join('=').trim();
        result[key.trim()] = val;
    }

    return result;
}

function generateSecret(length = 48) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
