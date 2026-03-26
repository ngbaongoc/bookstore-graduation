const Order = require('./order.model');

const getRFMAnalysis = async () => {
    const today = new Date();
    
    // Step 1: MongoDB Aggregation
    const rawData = await Order.aggregate([
        {
            $group: {
                _id: "$userId",
                monetary: { $sum: "$totalPrice" },
                frequency: { $count: {} },
                lastOrderDate: { $max: "$createdAt" }
            }
        },
        {
            $project: {
                userId: "$_id",
                monetary: 1,
                frequency: 1,
                recencyDays: {
                    $floor: {
                        $divide: [
                            { $subtract: [today, "$lastOrderDate"] },
                            1000 * 60 * 60 * 24
                        ]
                    }
                }
            }
        }
    ]);

    if (rawData.length === 0) return [];

    const n = rawData.length;

    // Helper to assign scores [1-5] based on quintiles
    const assignQuintileScore = (data, field, descending = true) => {
        const sorted = [...data].sort((a, b) => descending ? b[field] - a[field] : a[field] - b[field]);
        
        return data.map(item => {
            const rank = sorted.findIndex(s => s.userId === item.userId);
            // Rank is 0-indexed. Top 20% (0 to 0.2*n - 1) get 5.
            // score = 5 - floor(rank / (n/5))
            let score = 5 - Math.floor((rank * 5) / n);
            if (score < 1) score = 1;
            if (score > 5) score = 5;
            return { ...item, [`${field}Score`]: score };
        });
    };

    // Step 2: Sorting and Quintile Assignment
    let scoredData = assignQuintileScore(rawData, 'monetary', true);
    scoredData = assignQuintileScore(scoredData, 'frequency', true);
    scoredData = assignQuintileScore(scoredData, 'recencyDays', false); // Lower is better for recency

    // Step 3: Concatenate RFM Code and assign segment
    const finalReport = scoredData.map(item => {
        const R = item.recencyDaysScore;
        const F = item.frequencyScore;
        const M = item.monetaryScore;
        return {
            ...item,
            rfmCode: `${R}${F}${M}`,
            segment: getPutlerSegment(R, F, M)
        };
    });

    return finalReport;
};

// Mapping common score patterns to Putler segments
const getPutlerSegment = (R, F, M) => {
    if (R >= 4 && F >= 4 && M >= 4) return "Champions";
    if (R >= 2 && F >= 3 && M >= 3) return "Loyal Customers";
    if (R >= 3 && F <= 3 && M <= 3) return "Potential Loyalist";
    if (R >= 4 && F === 1) return "New Customers";
    if (R >= 3 && F === 1) return "Promising";
    if (R >= 2 && R <= 3 && F >= 2 && F <= 3 && M >= 2 && M <= 3) return "Needs Attention";
    if (R >= 2 && R <= 3 && F <= 2 && M <= 2) return "About to Sleep";
    if (R <= 2 && F >= 2 && M >= 2) return "At Risk";
    if (R <= 2 && F >= 4 && M >= 4) return "Can't Lose Them";
    if (R <= 2 && F <= 2 && M <= 2) return "Hibernating";
    return "Lost";
};

module.exports = { getRFMAnalysis };
