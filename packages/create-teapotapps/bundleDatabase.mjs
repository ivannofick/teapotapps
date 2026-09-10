import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

export async function bundleDatabase(args = []) {
    try {
        const projectName = args[0] || 'teapotapps';
        const targetDir = path.resolve(process.cwd(), projectName);

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const localDbTemplates = path.resolve(__dirname, 'templates', 'databases');

        console.log('📦 Bundling database templates locally...');

        // Salin seluruh isi folder configs dari templates/databases ke target src/configs
        await fs.copy(
            path.join(localDbTemplates, 'configs'),
            path.join(targetDir, 'src', 'configs')
        );

        // Salin seluruh isi folder libs dari templates/databases ke target src/libs (DataTypesCustom.js, WithTransaction.js)
        await fs.copy(
            path.join(localDbTemplates, 'libs'),
            path.join(targetDir, 'src', 'libs')
        );

        // Salin seluruh isi folder models dari templates/databases ke target src/models
        await fs.copy(
            path.join(localDbTemplates, 'models'),
            path.join(targetDir, 'src', 'models')
        );

        console.log('✅ Database files bundled and saved successfully!');
    } catch (error) {
        if (error.message?.includes('SIGINT')) {
            console.log('\n❌ Prompt dibatalkan oleh user (Ctrl+C). Keluar...');
            process.exit(0);
        } else {
            console.error('❌ Terjadi error saat proses database bundling:', error);
            process.exit(1);
        }
    }
}
