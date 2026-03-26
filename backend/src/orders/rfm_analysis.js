const Order = require('./order.model');

const getRFMAnalysis = async () => {
    const today = new Date();
    
    // Step 1: MongoDB Aggregation
    const rawData = await Order.aggregate([
        {
            $match: {
                status: 'Delivery',
                'stageDates.Delivery': { $ne: null }
            }
        },
        {
            $group: {
                _id: "$userId",
                monetary: { $sum: "$totalPrice" },
                frequency: { $count: {} },
                lastOrderDate: { $max: "$stageDates.Delivery" }
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
    // 1. Champions: Bought recently, buy often and spend the most
    if (R >= 4 && F >= 4 && M >= 4) return "Champions";
    
    // 2. Loyal Customers: Buy on a regular basis. Responsive to promotions.
    if (R >= 3 && F >= 3 && M >= 3) return "Loyal Customers";
    
    // 3. Can't Lose Them: Used to purchase frequently but haven't returned for a long time.
    if (R <= 2 && F >= 4 && M >= 4) return "Can't Lose Them";
    
    // 4. At Risk: Purchased often but a long time ago.
    if (R <= 2 && F >= 3) return "At Risk";
    
    // 5. New Customers: Bought most recently, but only once/few times.
    if (R >= 4 && F <= 1) return "New Customers";
    
    // 6. Promising: Bought recently, but haven't spent much.
    if (R === 3 && F <= 1) return "Promising";
    
    // 7. Potential Loyalist: Recent customers, average frequency.
    if (R >= 3 && F >= 2 && F <= 3) return "Potential Loyalist";
    
    // 8. Needs Attention: Average recency and frequency, maybe didn't buy very recently.
    if (R >= 2 && R <= 3 && F >= 2 && F <= 3) return "Needs Attention";
    
    // 9. About to Sleep: Below average recency and frequency.
    if (R === 2 && F <= 2) return "About to Sleep";
    
    // 10. Lost: Lowest scores across the board.
    if (R <= 1 && F <= 1 && M <= 1) return "Lost";
    
    // 11. Hibernating: Last purchase was long back, low frequency.
    if (R <= 2 && F <= 2) return "Hibernating";
    
    // Fallbacks just in case a combination drops through
    if (R >= 4) return "Potential Loyalist";
    if (R === 3) return "Needs Attention";
    return "Lost";
};

module.exports = { getRFMAnalysis };
