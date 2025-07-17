import dotenv from 'dotenv';

dotenv.config({ override: true });

for (const key in process.env) {
  if (key.startsWith('APP_')) {
    globalThis[key] = process.env[key];
  }
}
