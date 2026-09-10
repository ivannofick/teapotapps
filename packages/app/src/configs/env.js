import dotenv from 'dotenv';

dotenv.config({ override: true });

const defaults = {
  APP_DEBUG: 'true',
  APP_NAME: 'TeapotApps',
  APP_PORT: '3010',
  APP_HOST: '0.0.0.0',
  APP_FRONTEND: '',
  APP_KEY: '',
  APP_ACCESS_TOKEN_SECRET: ''
};

for (const [key, value] of Object.entries(defaults)) {
  globalThis[key] = process.env[key] ?? value;
}

for (const key in process.env) {
  if (key.startsWith('APP_')) {
    globalThis[key] = process.env[key];
  }
}
