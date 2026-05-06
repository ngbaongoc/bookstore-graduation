const sgMail = require('@sendgrid/mail');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Initialize SendGrid with API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Generic function to send email via SendGrid
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 */
const sendEmail = async ({ to, subject, html }) => {
    const msg = {
        to,
        from: {
            email: process.env.SENDGRID_FROM_EMAIL,
            name: 'ViBooks'
        },
        subject,
        html,
    };

    try {
        const response = await sgMail.send(msg);
        console.log(`Email sent to ${to} successfully via SendGrid.`);
        return { success: true, statusCode: response[0].statusCode };
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error.response ? error.response.body : error.message);
        return { success: false, error: error.message };
    }
};

module.exports = sendEmail;
