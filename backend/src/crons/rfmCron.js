const cron = require('node-cron');
const { getRFMAnalysis } = require('../orders/rfm_analysis');
const User = require('../users/user.model');

const initRfmCron = () => {
    // Run at 02:00 AM every Sunday
    cron.schedule('0 2 * * 0', async () => {
        try {
            console.log('Running weekly RFM analysis job...');
            const rfmReport = await getRFMAnalysis();
            
            if (rfmReport.length > 0) {
                for (const entry of rfmReport) {
                    await User.findOneAndUpdate(
                        { userId: entry.userId },
                        { 
                            $set: { 
                                rfmCode: entry.rfmCode, 
                                segment: entry.segment 
                            } 
                        }
                    );
                }
                console.log(`RFM analysis complete. Updated ${rfmReport.length} users.`);
            }
        } catch (error) {
            console.error('Error in RFM cronjob:', error);
        }
    });

    console.log('RFM Job scheduled (runs at 02:00 AM every Sunday).');
};

module.exports = initRfmCron;
