import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

export async function bundleDatabase(args = []) {
    try {
        const projectName = args[0] || 'teapotapps';
        const targetDir = path.resolve(process.cwd(), projectName);

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        // 📁 Path folder tujuan
        const libsDir = path.join(targetDir, 'src', 'libs');
        const configsDir = path.join(targetDir, 'src', 'configs');
        const modelsDir = path.join(targetDir, 'src', 'models');

        // 📄 Path tujuan file
        const libsDestPath = path.join(libsDir, 'DataTypesCustom.js');
        const configsDestPath = path.join(configsDir, 'database.js');
        const modelsDestPath = path.join(modelsDir, 'WellcomeModels.js');

        // 📄 Path sumber file dari template
        const libsSourcePath = path.resolve(__dirname, 'templates', 'databases', 'libs', 'DataTypesCustom.js');
        const configsSourcePath = path.resolve(__dirname, 'templates', 'databases', 'configs', 'database.js');
        const modelsSourcePath = path.resolve(__dirname, 'templates', 'databases', 'models', 'WellcomeModels.js');

        // 🔍 DEBUG LOG
        console.log('🔎 DEBUG:');
        console.log('  • libs      :', libsSourcePath, '->', libsDestPath);
        console.log('  • configs   :', configsSourcePath, '->', configsDestPath);
        console.log('  • models    :', modelsSourcePath, '->', modelsDestPath);

        // ✅ Cek file source semua ada
        for (const file of [libsSourcePath, configsSourcePath, modelsSourcePath]) {
            try {
                await fs.access(file);
            } catch {
                throw new Error(`❌ Source file does NOT exist: ${file}`);
            }
        }

        // ✅ Buat folder tujuan kalau belum ada
        await fs.mkdir(libsDir, { recursive: true });
        await fs.mkdir(configsDir, { recursive: true });
        await fs.mkdir(modelsDir, { recursive: true });

        // 🚀 Copy semua file
        await fs.copyFile(libsSourcePath, libsDestPath);
        console.log('📁 Copied DataTypesCustom.js to src/libs/');

        await fs.copyFile(configsSourcePath, configsDestPath);
        console.log('📁 Copied database.js to src/configs/');

        await fs.copyFile(modelsSourcePath, modelsDestPath);
        console.log('📁 Copied WellcomeModels.js to src/models/');

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
