const cron = require('node-cron');
const { getRFMAnalysis } = require('../orders/rfm_analysis');
const User = require('../users/user.model');
const sendEmail = require('../utils/sendEmail');
const { buildMysteryDate, renderMysteryEmail } = require('../emails/mysteryEmail');

const TARGET_SEGMENTS = ["Lost", "Hibernating"];

/**
 * Executes the Mystery Book Date email campaign.
 * Targets "Lost" and "Hibernating" users.
 */
const runMysteryEmailCampaign = async () => {
    console.log('[CRON] Starting Mystery Book Date email campaign...');
    
    try {
        const rfmData = await getRFMAnalysis();
        const targetUsers = rfmData.filter(user => TARGET_SEGMENTS.includes(user.segment));
        
        console.log(`[CRON] Found ${targetUsers.length} users in target segments (${TARGET_SEGMENTS.join(', ')}).`);

        let sentCount = 0;
        let skippedCount = 0;

        for (const userData of targetUsers) {
            try {
                const user = await User.findOne({ userId: userData.userId });
                if (!user || !user.email) {
                    skippedCount++;
                    continue;
                }

                // Generate mystery book data
                const mysteryData = await buildMysteryDate(user.userId);
                
                if (!mysteryData || !mysteryData.bookId) {
                    console.log(`[CRON] Skipped ${user.email} - no suitable mystery book found.`);
                    skippedCount++;
                    continue;
                }

                // Render email
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                const html = renderMysteryEmail(mysteryData, frontendUrl);

                // Send email
                const emailResult = await sendEmail({
                    to: user.email,
                    subject: "Blind Date with a Book 🕵️‍♀️",
                    html: html
                });

                if (emailResult.success) {
                    sentCount++;
                } else {
                    console.error(`[CRON] Failed to send to ${user.email}:`, emailResult.error);
                    skippedCount++;
                }

                // Small delay to prevent rate-limiting
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (userErr) {
                console.error(`[CRON] Error processing user ${userData.userId}:`, userErr);
                skippedCount++;
            }
        }

        console.log(`[CRON] Mystery Book Date campaign finished. Sent: ${sentCount}, Skipped: ${skippedCount}.`);
    } catch (error) {
        console.error('[CRON] Error running Mystery Book Date campaign:', error);
    }
};

/**
 * Initializes the cron job to run on the 20th of every month at 10:00 AM.
 * 0 10 20 * *
 */
const initMysteryEmailCron = () => {
    cron.schedule('0 10 20 * *', () => {
        runMysteryEmailCampaign();
    }, {
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh"
    });
    console.log('[CRON] Mystery Book Date campaign scheduled for the 20th of every month at 10:00 AM.');
};

module.exports = {
    initMysteryEmailCron,
    runMysteryEmailCampaign
};
