import { addDependency, startSpinner } from "./helpers.mjs";
import path from 'path';
import inquirer from 'inquirer';
import { bundleDatabase } from "./bundleDatabase.mjs";


export async function installDatabases(args = []) {
    try {
        const projectName = args[0] || 'teapotapps';
        const targetDir = path.resolve(process.cwd(), projectName);
        const sequelizeSpinner = startSpinner('\n🛠️ Installing sequelize');
        addDependency(targetDir, 'sequelize', '^6.37.7')
        clearInterval(sequelizeSpinner);
        process.stdout.write('\r✅ Sequelize installed successfully!\n');

        const { selectedDbPackage } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedDbPackage',
                message: '📦 Select the database you want to install:',
                choices: [
                    { name: 'PostgreSQL', value: 'PostgreSQL' },
                    { name: 'Skip.....', value: 'Skip.....' }
                ]
            }
        ]);
        if (selectedDbPackage === "PostgreSQL") {
            const pgSpinner = startSpinner('\n🐘 Installing pg');
            await addDependency(targetDir, 'pg', '^8.16.3');
            clearInterval(pgSpinner);
            process.stdout.write('\r✅ PostgreSQL installed successfully!\n');

            const hstoreSpinner = startSpinner('\n📦 Installing pg-hstore');
            await addDependency(targetDir, 'pg-hstore', '^2.3.4');
            clearInterval(hstoreSpinner);
            process.stdout.write('\r✅ pg-hstore installed successfully!\n');
        }
        await bundleDatabase(args)
    } catch (error) {
        if (error.message?.includes('SIGINT')) {
            console.log('\n❌ Prompt dibatalkan oleh user (Ctrl+C). Keluar...');
            process.exit(0); // keluar dengan sukses, bukan error
        } else {
            console.error('❌ Terjadi error saat prompt:', error);
            process.exit(1);
        }
    }
}

