import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

async function copyFolderRecursive(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyFolderRecursive(srcPath, destPath);
        } else if (entry.isFile()) {
            await fs.copyFile(srcPath, destPath);
        } else if (entry.isSymbolicLink()) {
            const symlink = await fs.readlink(srcPath);
            await fs.symlink(symlink, destPath);
        }
    }
}

export async function bundleMailer(args = []) {
    try {
        const projectName = args[0] || 'teapotapps';
        const targetDir = path.resolve(process.cwd(), projectName);

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const libsDir = path.join(targetDir, 'src', 'utils');
        const configsDir = path.join(targetDir, 'src', 'configs');

        const libsSourceDir = path.resolve(__dirname, 'templates', 'mailists', 'utils');
        const configsSourceFile = path.resolve(__dirname, 'templates', 'mailists', 'configs', 'mail.js');

        const configsDestPath = path.join(configsDir, 'mail.js');

        await fs.access(libsSourceDir);
        await fs.access(configsSourceFile);

        await fs.mkdir(libsDir, { recursive: true });
        await fs.mkdir(configsDir, { recursive: true });

        await copyFolderRecursive(libsSourceDir, libsDir);

        await fs.copyFile(configsSourceFile, configsDestPath);

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
