import fs from 'fs-extra';
import path from 'path';

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function cleanName(str) {
    if (!str) return '';
    return str.replace(/controller$/i, '').replace(/models?$/i, '');
}

function pluralize(str) {
    if (!str) return '';
    const lower = str.toLowerCase();
    if (lower.endsWith('s')) return lower;
    return `${lower}s`;
}

export default async function runBrew(args = []) {
    const [subCommand, rawName, ...options] = args;
    const projectDir = process.cwd();

    if (!subCommand || !rawName) {
        console.log(`
🫖 TeapotApps Brew Generator

Usage:
  teapotapps brew controller <name>    Generate a new controller
  teapotapps brew model <name>         Generate a new Sequelize model
  teapotapps brew middleware <name>    Generate a new middleware
  teapotapps brew api <name> [--auth]  Generate controller, model, & wire API route

Examples:
  teapotapps brew controller products
  teapotapps brew model products
  teapotapps brew middleware checkRole
  teapotapps brew api products --auth
        `);
        return;
    }

    const baseName = capitalize(cleanName(rawName));
    const isAuth = options.includes('--auth') || options.includes('-a');

    switch (subCommand.toLowerCase()) {
        case 'controller':
            await brewController(projectDir, baseName);
            break;
        case 'model':
            await brewModel(projectDir, baseName, rawName);
            break;
        case 'middleware':
            await brewMiddleware(projectDir, rawName);
            break;
        case 'api':
            await brewApi(projectDir, baseName, rawName, isAuth);
            break;
        default:
            console.error(`❌ Unknown brew command: "${subCommand}". Use controller, model, middleware, or api.`);
            process.exit(1);
    }
}

async function brewController(projectDir, baseName) {
    const controllersDir = path.join(projectDir, 'src', 'controllers');
    await fs.ensureDir(controllersDir);

    const fileName = `${baseName}Controller.js`;
    const filePath = path.join(controllersDir, fileName);

    if (await fs.pathExists(filePath)) {
        console.error(`❌ Controller already exists: ${fileName}`);
        return;
    }

    const content = `import { responseApi } from "../libs/RestApiHandler.js";

export const getAll = async (req, res) => {
    return responseApi(res, [], null, "${baseName} list retrieved successfully");
};

export const getById = async (req, res) => {
    const { id } = req.params;
    return responseApi(res, { id }, null, "${baseName} detail retrieved successfully");
};

export const create = async (req, res) => {
    return responseApi(res, req.body, null, "${baseName} created successfully");
};

export const update = async (req, res) => {
    const { id } = req.params;
    return responseApi(res, { id, ...req.body }, null, "${baseName} updated successfully");
};

export const remove = async (req, res) => {
    const { id } = req.params;
    return responseApi(res, { id }, null, "${baseName} deleted successfully");
};
`;

    await fs.writeFile(filePath, content, 'utf8');
    console.log(`🍵 Brewed controller: src/controllers/${fileName}`);
}

async function brewModel(projectDir, baseName, rawName) {
    const modelsDir = path.join(projectDir, 'src', 'models');
    await fs.ensureDir(modelsDir);

    const fileName = `${baseName}Models.js`;
    const filePath = path.join(modelsDir, fileName);

    if (await fs.pathExists(filePath)) {
        console.error(`❌ Model already exists: ${fileName}`);
        return;
    }

    const tableName = pluralize(cleanName(rawName));

    const content = `import db from "../configs/database.js";
import DataTypesCustom from "../libs/DataTypesCustom.js";
const { TYPES } = DataTypesCustom;

const ${baseName}Models = db.define("${tableName}", {
    id: {
        type: TYPES.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: TYPES.STRING(255),
        allowNull: false,
    },
    created_at: {
        type: TYPES.BIGINT,
        allowNull: true,
    },
    updated_at: {
        type: TYPES.BIGINT,
        allowNull: true,
    },
}, {
    freezeTableName: true,
    timestamps: false,
});

export default ${baseName}Models;
`;

    await fs.writeFile(filePath, content, 'utf8');
    console.log(`🍵 Brewed model: src/models/${fileName}`);
}

async function brewMiddleware(projectDir, rawName) {
    const middlewaresDir = path.join(projectDir, 'src', 'middlewares');
    await fs.ensureDir(middlewaresDir);

    const fnName = rawName.charAt(0).toLowerCase() + rawName.slice(1);
    const fileName = `${fnName}.js`;
    const filePath = path.join(middlewaresDir, fileName);

    if (await fs.pathExists(filePath)) {
        console.error(`❌ Middleware already exists: ${fileName}`);
        return;
    }

    const content = `export const ${fnName} = (req, res, next) => {
    // Middleware logic here
    next();
};
`;

    await fs.writeFile(filePath, content, 'utf8');
    console.log(`🍵 Brewed middleware: src/middlewares/${fileName}`);
}

async function brewApi(projectDir, baseName, rawName, isAuth = false) {
    console.log(`🚀 Brewing complete API module for "${baseName}"...`);
    await brewController(projectDir, baseName);
    await brewModel(projectDir, baseName, rawName);

    const routesPath = path.join(projectDir, 'src', 'routes', 'api.js');
    if (!(await fs.pathExists(routesPath))) {
        console.warn(`⚠️  Routes file not found at src/routes/api.js. Skipping route wire-up.`);
        return;
    }

    const routePrefix = pluralize(cleanName(rawName));
    let routesContent = await fs.readFile(routesPath, 'utf8');

    const importStatement = `import * as ${baseName}Controller from '../controllers/${baseName}Controller.js';`;
    const middlewareArray = isAuth ? '[verifyToken]' : '[]';

    const routeBlock = `
// ${baseName} API Routes
routeGroup(router, "/api/${routePrefix}", ${middlewareArray}, (api) => {
    api.get('/', ${baseName}Controller.getAll);
    api.get('/:id', ${baseName}Controller.getById);
    api.post('/', ${baseName}Controller.create);
    api.put('/:id', ${baseName}Controller.update);
    api.delete('/:id', ${baseName}Controller.remove);
});
`;

    if (!routesContent.includes(importStatement)) {
        routesContent = `${importStatement}\n${routesContent}`;
    }

    const exportIndex = routesContent.lastIndexOf('export default router');
    if (exportIndex !== -1) {
        routesContent = routesContent.slice(0, exportIndex) + routeBlock + '\n' + routesContent.slice(exportIndex);
    } else {
        routesContent += `\n${routeBlock}`;
    }

    await fs.writeFile(routesPath, routesContent.trim() + '\n', 'utf8');
    console.log(`🍵 Wired API routes into src/routes/api.js -> /api/${routePrefix} ${isAuth ? '(protected)' : '(public)'}`);
    console.log(`🎉 Complete API module "${baseName}" ready!`);
}
