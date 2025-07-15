/**
 * Environment Variable Loader for TeapotApp
 * -----------------------------------------
 * 
 * This file loads and validates required environment variables
 * from the `.env` file using the `dotenv` package. It enforces
 * the presence of specific `TEA_`-prefixed variables to ensure 
 * the application has all the configuration it needs to run.
 * 
 * ✅ How it works:
 * - Loads all variables into `process.env`
 * - Checks for the existence of required variables (like TEA_PORT, TEA_DB_HOST, etc.)
 * - Injects each validated variable into the global scope as `globalThis.TEA_<KEY>`
 * 
 * ❌ If any required variable is missing, the application will:
 * - Log the missing keys
 * - Exit immediately using `process.exit(1)`
 * 
 * 🧠 Notes:
 * - Prefix used is `TEA_` instead of the usual `APP_` to allow for customization
 * - You can access any variable globally using `TEA_PORT`, `TEA_DB_HOST`, etc.
 * - This setup is useful for consistent config management across large apps
 * 
 * 📦 Example:
 *   In `.env`:
 *     TEA_PORT=3010
 *     TEA_DB_HOST=127.0.0.1
 * 
 *   In any JS file:
 *     console.log(TEA_PORT);       // 3010
 *     console.log(TEA_DB_HOST);    // 127.0.0.1
 */

import dotenv from 'dotenv';

// Load all environment variables from .env into process.env
dotenv.config({ override: true });

// List of required TEA_ environment variable suffixes
const requiredKeys = [
    'NAME',
    'PORT',
    'HOST',
    'FRONTEND',
    'ACCESS_TOKEN_SECRET',
    'KEY',
    'DB_CONNECTION',
    'DB_HOST',
    'DB_PORT',
    'DB_DATABASE',
    'DB_USERNAME',
    'DB_PASSWORD',
    'MAIL_DRIVER',
    'MAIL_HOST',
    'MAIL_PORT',
    'MAIL_USERNAME',
    'MAIL_PASSWORD'
];

// Initialize global app config container (optional if needed)
globalThis.APP = {};

// Keep track of any missing keys
const missing = [];

for (const key of requiredKeys) {
  const envKey = `APP_${key}`;
  const value = process.env[`TEA_${key}`];
  if (value === undefined) {
    missing.push(envKey);
  } else {
    globalThis[envKey] = value;
  }
}

// Stop the app if any required variables are missing
if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(k => console.error(`- ${k}`));
    process.exit(1);
}