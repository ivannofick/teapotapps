import { addDependency, startSpinner } from "./helpers.mjs";
import path from 'path';
import inquirer from 'inquirer';
import { bundleDatabase } from "./bundleDatabase.mjs";

export const DB_CONFIGS = {
    postgresql: {
        name: 'PostgreSQL (pg + pg-hstore)',
        connection: 'postgres',
        port: 5432,
        install: async (targetDir) => {
            const pgSpinner = startSpinner('\n🐘 Installing pg');
            await addDependency(targetDir, 'pg', '^8.16.3');
            clearInterval(pgSpinner);
            process.stdout.write('\r✅ PostgreSQL installed successfully!\n');

            const hstoreSpinner = startSpinner('\n📦 Installing pg-hstore');
            await addDependency(targetDir, 'pg-hstore', '^2.3.4');
            clearInterval(hstoreSpinner);
            process.stdout.write('\r✅ pg-hstore installed successfully!\n');
        }
    },
    mysql: {
        name: 'MySQL (mysql2)',
        connection: 'mysql',
        port: 3306,
        install: async (targetDir) => {
            const mysqlSpinner = startSpinner('\n🐬 Installing mysql2');
            await addDependency(targetDir, 'mysql2', '^3.12.0');
            clearInterval(mysqlSpinner);
            process.stdout.write('\r✅ mysql2 installed successfully!\n');
        }
    },
    mariadb: {
        name: 'MariaDB (mariadb)',
        connection: 'mariadb',
        port: 3306,
        install: async (targetDir) => {
            const mariaSpinner = startSpinner('\n🦭 Installing mariadb');
            await addDependency(targetDir, 'mariadb', '^3.4.0');
            clearInterval(mariaSpinner);
            process.stdout.write('\r✅ mariadb installed successfully!\n');
        }
    }
};

export async function installDatabases(args = [], chosenEngine = null) {
    try {
        const projectName = args[0] || 'teapotapps';
        const targetDir = (projectName === '.' || projectName === '')
            ? process.cwd()
            : path.resolve(process.cwd(), projectName);

        let engine = chosenEngine;
        if (!engine) {
            const { selectedDb } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'selectedDb',
                    message: '📦 Select the database you want to install:',
                    choices: [
                        { name: 'PostgreSQL', value: 'postgresql' },
                        { name: 'MySQL', value: 'mysql' },
                        { name: 'MariaDB', value: 'mariadb' },
                        { name: 'Skip', value: 'skip' }
                    ]
                }
            ]);
            engine = selectedDb;
        }

        if (engine === 'skip' || !engine || !DB_CONFIGS[engine]) {
            return null;
        }

        const sequelizeSpinner = startSpinner('\n🛠️ Installing sequelize');
        await addDependency(targetDir, 'sequelize', '^6.37.7');
        clearInterval(sequelizeSpinner);
        process.stdout.write('\r✅ Sequelize installed successfully!\n');

        await DB_CONFIGS[engine].install(targetDir);
        await bundleDatabase(args);

        return DB_CONFIGS[engine];
    } catch (error) {
        if (error.name === 'ExitPromptError' || error.message?.includes('SIGINT') || error.message?.includes('force closed')) {
            console.log('\n❌ Prompt cancelled by user. Exiting...');
            process.exit(0);
        } else {
            console.error('❌ Error during database setup:', error);
            process.exit(1);
        }
    }
}

