/**
 * Email Transport Configuration
 * -----------------------------
 * 
 * This file initializes and exports a preconfigured Nodemailer transporter
 * using the global environment variables loaded at runtime (TEA_ or APP_).
 * 
 * ✉️ Purpose:
 * - To enable sending emails via SMTP using Nodemailer
 * 
 * ⚙️ Configuration:
 * - Uses environment variables such as:
 *   - APP_MAIL_HOST       → SMTP host (e.g., smtp.gmail.com)
 *   - APP_MAIL_PORT       → SMTP port (usually 465 for SSL or 587 for TLS)
 *   - APP_MAIL_USERNAME   → SMTP username (email address)
 *   - APP_MAIL_PASSWORD   → SMTP password or app-specific token
 * 
 * ✅ Example:
 *   transporter.sendMail({
 *     from: APP_MAIL_USERNAME,
 *     to: 'recipient@example.com',
 *     subject: 'Hello from TeapotApp',
 *     text: '418 I'm a Teapot'
 *   });
 * 
 * This transporter can be reused across the application to send transactional or notification emails.
 */

import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: APP_MAIL_HOST,
    port: APP_MAIL_PORT,
    auth: {
        user: APP_MAIL_USERNAME,
        pass: APP_MAIL_PASSWORD,
    },
});
