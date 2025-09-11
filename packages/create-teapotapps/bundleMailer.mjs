import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

export async function bundleMailer(args = []) {
    try {
        const projectName = args[0] || 'teapotapps';
        const targetDir = path.resolve(process.cwd(), projectName);

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const configsDir = path.join(targetDir, 'src', 'configs');
        const mailDir = path.join(targetDir, 'src', 'utils', 'mail');
        const templatesDir = path.join(mailDir, 'templates');

        const configsDestPath = path.join(configsDir, 'mail.js');
        const mailerDestPath = path.join(mailDir, 'mailer.js');
        const welcomeEmailDestPath = path.join(templatesDir, 'generateWelcomeEmail.js');

        // GitHub raw URLs
        const configsSourceUrl =
            'https://raw.githubusercontent.com/teapotapps/project/master/packages/create-teapotapps/templates/mailists/configs/mail.js';
        const mailerSourceUrl =
            'https://raw.githubusercontent.com/teapotapps/project/master/packages/create-teapotapps/templates/mailists/utils/mail/mailer.js';
        const welcomeEmailSourceUrl =
            'https://raw.githubusercontent.com/teapotapps/project/master/packages/create-teapotapps/templates/mailists/utils/mail/templates/generateWelcomeEmail.js';

        // Helper function
        async function downloadFile(url, destPath) {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`❌ Failed to fetch file: ${url}`);
            }
            const data = await response.text();
            await fs.mkdir(path.dirname(destPath), { recursive: true });
            await fs.writeFile(destPath, data);
        }

        // Check URL availability
        for (const url of [configsSourceUrl, mailerSourceUrl, welcomeEmailSourceUrl]) {
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`❌ Source file does NOT exist: ${url}`);
            } catch {
                throw new Error(`❌ Source file does NOT exist: ${url}`);
            }
        }

        // Download files
        await downloadFile(configsSourceUrl, configsDestPath);
        await downloadFile(mailerSourceUrl, mailerDestPath);
        await downloadFile(welcomeEmailSourceUrl, welcomeEmailDestPath);

        console.log('✅ Mailer files cloned and saved successfully!');
    } catch (error) {
        if (error.message?.includes('SIGINT')) {
            console.log('\n❌ Prompt dibatalkan oleh user (Ctrl+C). Keluar...');
            process.exit(0);
        } else {
            console.error('❌ Terjadi error saat proses:', error);
            process.exit(1);
        }
    }
}
