import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

export async function bundleMailer(args = []) {
    try {
        const projectName = args[0] || 'teapotapps';
        const targetDir = path.resolve(process.cwd(), projectName);

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const localMailTemplates = path.resolve(__dirname, 'templates', 'mailists');

        console.log('📦 Bundling mailer templates locally...');

        // Salin seluruh isi folder configs dari templates/mailists ke target src/configs
        await fs.copy(
            path.join(localMailTemplates, 'configs'),
            path.join(targetDir, 'src', 'configs')
        );

        // Salin seluruh isi folder utils dari templates/mailists ke target src/utils
        await fs.copy(
            path.join(localMailTemplates, 'utils'),
            path.join(targetDir, 'src', 'utils')
        );

        console.log('✅ Mailer files bundled and saved successfully!');
    } catch (error) {
        if (error.message?.includes('SIGINT')) {
            console.log('\n❌ Prompt dibatalkan oleh user (Ctrl+C). Keluar...');
            process.exit(0);
        } else {
            console.error('❌ Terjadi error saat proses mailer bundling:', error);
            process.exit(1);
        }
    }
}
