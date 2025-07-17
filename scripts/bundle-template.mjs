import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path
const source = path.resolve(__dirname, '../packages/create-teapotapps');
const target = path.resolve(__dirname, '../packages/teapotapps');

console.log(`📦 Copying API template to CLI...`);

await fs.remove(target);
await fs.copy(source, target, {
    filter: (src) => !src.includes('node_modules') && !src.includes('.git')
});

console.log('✅ Template copied to CLI for publish');
