const cron = require('node-cron');
const { getRFMAnalysis } = require('../orders/rfm_analysis');
const { buildWrappedStats, renderWrappedEmail } = require('../emails/wrappedEmail');
const sendEmail = require('../utils/sendEmail');
const User = require('../users/user.model');

const TARGET_SEGMENTS = ['Champions', 'Loyal Customers'];

/**
 * Send the "Reader's Wrapped" personalized retrospective email
 * to all Champions and Loyal Customers.
 */
const runWrappedEmailCampaign = async () => {
    console.log('[WrappedCron] Starting Reader\'s Wrapped campaign...');
    const year = new Date().getFullYear();

    try {
        // Step 1: Get all users with their RFM segments
        const rfmReport = await getRFMAnalysis();
        const eligibleUsers = rfmReport.filter(u => TARGET_SEGMENTS.includes(u.segment));

        if (eligibleUsers.length === 0) {
            console.log('[WrappedCron] No eligible users found for this campaign.');
            return;
        }

        console.log(`[WrappedCron] Found ${eligibleUsers.length} eligible users (Champions + Loyal Customers).`);

        let sent = 0, skipped = 0, failed = 0;

        // Step 2: For each eligible user, build stats and send email
        for (const rfmEntry of eligibleUsers) {
            try {
                // Fetch user's email address from the users collection
                const user = await User.findOne({ userId: rfmEntry.userId }).select('email username').lean();
                if (!user || !user.email) {
                    console.warn(`[WrappedCron] No email found for userId: ${rfmEntry.userId}. Skipping.`);
                    skipped++;
                    continue;
                }

                // Step 3: Build personalized stats from MongoDB
                const stats = await buildWrappedStats(rfmEntry.userId, year);
                if (!stats) {
                    console.log(`[WrappedCron] No ${year} purchase data for ${user.email}. Skipping.`);
                    skipped++;
                    continue;
                }

                // Step 4: Render and send the email
                const html = renderWrappedEmail(stats);
                const result = await sendEmail({
                    to: user.email,
                    subject: `Your ${year} Reader's Wrapped is Here 📖`,
                    html,
                });

                if (result.success) {
                    console.log(`[WrappedCron] ✅ Sent to ${user.email} (${stats.badge.name})`);
                    sent++;
                } else {
                    console.error(`[WrappedCron] ❌ Failed for ${user.email}: ${result.error}`);
                    failed++;
                }

            } catch (userErr) {
                console.error(`[WrappedCron] Error processing userId ${rfmEntry.userId}:`, userErr.message);
                failed++;
            }
        }

        console.log(`[WrappedCron] Campaign complete. Sent: ${sent}, Skipped: ${skipped}, Failed: ${failed}.`);

    } catch (err) {
        console.error('[WrappedCron] Campaign failed with error:', err);
    }
};

/**
 * Initialize the cron job.
 * Runs automatically on December 1st at 08:00 AM every year.
 * You can also call runWrappedEmailCampaign() manually for testing.
 */
const initWrappedEmailCron = () => {
    // Schedule: December 1st at 08:00 AM
    cron.schedule('0 8 1 12 *', async () => {
        console.log('[WrappedCron] Annual trigger fired (Dec 1st 08:00).');
        await runWrappedEmailCampaign();
    });

    console.log('[WrappedCron] Reader\'s Wrapped cron job initialized (fires Dec 1st 08:00 AM annually).');
};

module.exports = { initWrappedEmailCron, runWrappedEmailCampaign };
