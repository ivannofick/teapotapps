import { addDependency, startSpinner } from "./helpers.mjs";
import path from 'path';
import { bundleMailer } from "./bundleMailer.mjs";

export async function installMailer(args = []) {
    let mailSpinner;
    try {
        const projectName = args[0] || 'teapotapps';
        const targetDir = path.resolve(process.cwd(), projectName);
        mailSpinner = startSpinner('\n✉️ Installing nodemailer');
        await addDependency(targetDir, 'nodemailer', '^7.0.3');
        clearInterval(mailSpinner);
        process.stdout.write('\r✅ Nodemailer installed successfully!\n');
        await bundleMailer(args);
    } catch (error) {
        clearInterval(mailSpinner);
        console.error(`\r❌ Failed to install Nodemailer: ${error.message}`);
    }
}
