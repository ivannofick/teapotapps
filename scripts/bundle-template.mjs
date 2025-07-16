import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('🔧 [DEBUG] Start running bundle-template.mjs');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 [DEBUG] __dirname:', __dirname);

const source = path.resolve(__dirname, '../packages/app');
const cliTarget = path.resolve(__dirname, '../packages/create-teapotapps/app');
const runtimeTarget = path.resolve(__dirname, '../packages/teapotapps');

console.log('🔧 [DEBUG] Source:', source);
console.log('🔧 [DEBUG] CLI Target:', cliTarget);
console.log('🔧 [DEBUG] Runtime Target:', runtimeTarget);

console.log(`📦 Copying API template to CLI...`);
await fs.remove(cliTarget);
console.log('✅ CLI target removed');
await fs.copy(source, cliTarget, {
    filter: (src) => !src.includes('node_modules') && !src.includes('.git')
});
console.log('✅ Template copied to CLI for publish');

console.log(`📦 Preparing to copy to runtime (teapotapps)...`);
await fs.ensureDir(runtimeTarget);
console.log('✅ Ensured runtime dir exists');
await fs.emptyDir(runtimeTarget);
console.log('✅ Emptied runtime dir');
await fs.copy(source, runtimeTarget, {
    filter: (src) => !src.includes('node_modules') && !src.includes('.git')
});
console.log('✅ Template copied to runtime (teapotapps)');

console.log('✅ All done (bundle-template.mjs)');
