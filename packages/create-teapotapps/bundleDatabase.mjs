import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

export async function bundleDatabase(args = []) {
    try {
        const projectName = args[0] || 'teapotapps';
        const targetDir = path.resolve(process.cwd(), projectName);

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const libsDir = path.join(targetDir, 'src', 'libs');
        const configsDir = path.join(targetDir, 'src', 'configs');
        const modelsDir = path.join(targetDir, 'src', 'models');

        const libsDestPath = path.join(libsDir, 'DataTypesCustom.js');
        const configsDestPath = path.join(configsDir, 'database.js');
        const modelsDestPath = path.join(modelsDir, 'WellcomeModels.js');

        // GitHub raw URL untuk file yang ingin diambil
        const libsSourceUrl = 'https://raw.githubusercontent.com/teapotapps/project/master/packages/create-teapotapps/templates/databases/libs/DataTypesCustom.js';
        const configsSourceUrl = 'https://raw.githubusercontent.com/teapotapps/project/master/packages/create-teapotapps/templates/databases/configs/database.js';
        const modelsSourceUrl = 'https://raw.githubusercontent.com/teapotapps/project/master/packages/create-teapotapps/templates/databases/models/WellcomeModels.js';

        // Helper function untuk download file dari GitHub
        async function downloadFile(url, destPath) {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`❌ Failed to fetch file: ${url}`);
            }
            const data = await response.text();
            await fs.mkdir(path.dirname(destPath), { recursive: true });
            await fs.writeFile(destPath, data);
        }

        // Check jika URL source bisa diakses (sebenarnya sudah dilakukan di downloadFile)
        for (const url of [libsSourceUrl, configsSourceUrl, modelsSourceUrl]) {
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`❌ Source file does NOT exist: ${url}`);
            } catch {
                throw new Error(`❌ Source file does NOT exist: ${url}`);
            }
        }

        // Download dan simpan file ke tujuan
        await downloadFile(libsSourceUrl, libsDestPath);
        await downloadFile(configsSourceUrl, configsDestPath);
        await downloadFile(modelsSourceUrl, modelsDestPath);

        console.log('✅ Files cloned and saved successfully!');
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
