const mongoose = require('mongoose');
const { getRFMAnalysis } = require('../src/orders/rfm_analysis');
const User = require('../src/users/user.model');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const runRfmNow = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to DB... Starting RFM Analysis.");

        const rfmReport = await getRFMAnalysis();
        console.log(`Calculated RFM for ${rfmReport.length} users.`);
        
        if (rfmReport.length > 0) {
            let updatedCount = 0;
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
                updatedCount++;
            }
            console.log(`✅ Success: Updated segments for ${updatedCount} users.`);
        } else {
            console.log("No orders found to analyze.");
        }

        mongoose.disconnect();
    } catch (error) {
        console.error("Error running RFM analysis:", error);
        process.exit(1);
    }
};

runRfmNow();
