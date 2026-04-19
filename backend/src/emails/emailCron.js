const cron = require('node-cron');
const ScheduledEmail = require('./scheduledEmail.model');
const sendEmail = require('../utils/sendEmail');

const initEmailCron = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();

            // Atomically claim pending emails by setting status to 'sending'
            const { modifiedCount } = await ScheduledEmail.updateMany(
                { status: 'pending', scheduledAt: { $lte: now } },
                { $set: { status: 'sending' } }
            );

            if (modifiedCount === 0) return;

            const emailsToSend = await ScheduledEmail.find({ status: 'sending' });
            console.log(`[EmailCron] Sending ${emailsToSend.length} scheduled email(s).`);

            for (const email of emailsToSend) {
                const result = await sendEmail({
                    to: email.to,
                    subject: email.subject,
                    html: email.html
                });

                if (result.success) {
                    email.status = 'sent';
                    console.log(`[EmailCron] Email sent to ${email.to}`);
                } else {
                    email.status = 'failed';
                    email.error = result.error;
                    console.error(`[EmailCron] Failed to send email to ${email.to}: ${result.error}`);
                }
                await email.save();
            }
        } catch (error) {
            console.error('[EmailCron] Error:', error);
        }
    });

    console.log('Scheduled email cron job started.');
};

module.exports = initEmailCron;
