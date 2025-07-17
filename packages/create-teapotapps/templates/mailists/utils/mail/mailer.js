import { transporter } from '../../config/mail.js';

/**
 * Sends an email using the configured transporter.
 *
 * @param {string} to - Recipient email address.
 * @param {string} subject - Subject line of the email.
 * @param {string} html - HTML content of the email body.
 * @param {string} [from='"YourName" <yourname@domain.com>'] - Optional sender information.
 *
 * @returns {Promise<Object>} - The result object from the email sending operation.
 *
 * @throws {Error} - If the email fails to send.
 *
 * ✅ Example usage:
 * await sendMail('user@example.com', 'Welcome!', '<h1>Hello there</h1>');
 */
export const sendMail = async (to, subject, html, from = '"YourName" <yourname@domain.com>') => {
    const mailOptions = {
        from,
        to,
        subject,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error;
    }
};
