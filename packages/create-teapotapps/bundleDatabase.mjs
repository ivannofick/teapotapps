import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

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

        const libsSourcePath = path.resolve(__dirname, 'templates', 'databases', 'libs', 'DataTypesCustom.js');
        const configsSourcePath = path.resolve(__dirname, 'templates', 'databases', 'configs', 'database.js');
        const modelsSourcePath = path.resolve(__dirname, 'templates', 'databases', 'models', 'WellcomeModels.js');

        for (const file of [libsSourcePath, configsSourcePath, modelsSourcePath]) {
            try {
                await fs.access(file);
            } catch {
                throw new Error(`❌ Source file does NOT exist: ${file}`);
            }
        }

        await fs.mkdir(libsDir, { recursive: true });
        await fs.mkdir(configsDir, { recursive: true });
        await fs.mkdir(modelsDir, { recursive: true });

        await fs.copyFile(libsSourcePath, libsDestPath);

        await fs.copyFile(configsSourcePath, configsDestPath);

        await fs.copyFile(modelsSourcePath, modelsDestPath);

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
