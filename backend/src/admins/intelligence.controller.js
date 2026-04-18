const Order = require('../orders/order.model');
const OrderItem = require('../orders/orderItem.model');
const Book = require('../books/book.model');
const User = require('../users/user.model');
const { getRFMAnalysis } = require('../orders/rfm_analysis');

const getAdvancedIntelligence = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let dateFilter = {};
        
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.createdAt = { $gte: start, $lte: end };
        } else {
            // Default to all-time if no date specified, to match standard RFM calculations
        }

        // 1. Compute and fetch global RFM User Segments
        const rfmData = await getRFMAnalysis();
        
        // Construct the switch branches to map userId -> Segment inline in MongoDB
        const branches = rfmData.map(s => ({
            case: { $eq: ["$userId", s.userId] },
            then: s.segment
        }));
        
        const segmentExpression = rfmData.length > 0 ? { $switch: { branches, default: "Unknown" } } : "Unknown";

        // 2. Base MongoDB Facet Aggregation Engine
        const aggregationResult = await Order.aggregate([
            { $match: dateFilter },
            {
                $addFields: { segment: segmentExpression }
            },
            {
                $facet: {
                    // BOARD 1: SEGMENTATION
                    segmentDistribution: [
                        {
                            $group: {
                                _id: "$segment",
                                count: { $sum: 1 },
                                revenue: { $sum: { $cond: [{ $ne: ["$cancelOrder", true] }, "$totalPrice", 0] } }
                            }
                        }
                    ],
                    topBooksBySegment: [
                        { $match: { cancelOrder: { $ne: true } } },
                        {
                            $lookup: {
                                from: "orderitems",
                                localField: "_id",
                                foreignField: "orderId",
                                as: "items"
                            }
                        },
                        { $unwind: "$items" },
                        {
                            $group: {
                                _id: { segment: "$segment", bookId: "$items.bookId" },
                                totalUnits: { $sum: "$items.quantity" }
                            }
                        },
                        {
                            $lookup: {
                                from: "books",
                                localField: "_id.bookId",
                                foreignField: "_id",
                                as: "bookData"
                            }
                        },
                        { $unwind: "$bookData" },
                        {
                            $project: {
                                segment: "$_id.segment",
                                bookId: "$_id.bookId",
                                title: "$bookData.title",
                                totalUnits: 1,
                                _id: 0
                            }
                        },
                        { $sort: { segment: 1, totalUnits: -1 } }
                    ],
                    // BOARD 2: REGIONAL
                    regionalPerformance: [
                        { $match: { cancelOrder: { $ne: true } } },
                        {
                            $group: {
                                _id: { $ifNull: ["$shippingCity", "Unknown"] },
                                totalOrders: { $sum: 1 },
                                revenue: { $sum: "$totalPrice" }
                            }
                        },
                        {
                            $project: {
                                city: "$_id",
                                totalOrders: 1,
                                revenue: 1,
                                aov: { $cond: [{ $eq: ["$totalOrders", 0] }, 0, { $divide: ["$revenue", "$totalOrders"] }] },
                                _id: 0
                            }
                        },
                        { $sort: { revenue: -1 } }
                    ],
                    topBooksByRegion: [
                        { $match: { cancelOrder: { $ne: true } } },
                        {
                            $lookup: {
                                from: "orderitems",
                                localField: "_id",
                                foreignField: "orderId",
                                as: "items"
                            }
                        },
                        { $unwind: "$items" },
                        {
                            $group: {
                                _id: { city: { $ifNull: ["$shippingCity", "Unknown"] }, bookId: "$items.bookId" },
                                totalUnits: { $sum: "$items.quantity" }
                            }
                        },
                        {
                            $lookup: {
                                from: "books",
                                localField: "_id.bookId",
                                foreignField: "_id",
                                as: "bookData"
                            }
                        },
                        { $unwind: "$bookData" },
                        {
                            $project: {
                                city: "$_id.city",
                                bookId: "$_id.bookId",
                                title: "$bookData.title",
                                totalUnits: 1,
                                _id: 0
                            }
                        },
                        { $sort: { city: 1, totalUnits: -1 } }
                    ],
                    // BOARD 3: CANCELLATIONS
                    cancellationReasons: [
                        { $match: { cancelOrder: true } },
                        {
                            $group: {
                                _id: { $ifNull: ["$cancelReason", "Other"] },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    cancellationBySegment: [
                        { $match: { cancelOrder: true } },
                        {
                            $group: {
                                _id: "$segment",
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    ghostedBooks: [
                        { $match: { cancelOrder: true } },
                        {
                            $lookup: {
                                from: "orderitems",
                                localField: "_id",
                                foreignField: "orderId",
                                as: "items"
                            }
                        },
                        { $unwind: "$items" },
                        {
                            $group: {
                                _id: { bookId: "$items.bookId", segment: "$segment", reason: { $ifNull: ["$cancelReason", "Other"] } },
                                cancelCount: { $sum: "$items.quantity" },
                                orderIds: { $addToSet: "$_id" }
                            }
                        },
                        {
                            $lookup: {
                                from: "books",
                                localField: "_id.bookId",
                                foreignField: "_id",
                                as: "bookData"
                            }
                        },
                        { $unwind: "$bookData" },
                        {
                            $project: {
                                bookId: "$_id.bookId",
                                title: "$bookData.title",
                                segment: "$_id.segment",
                                reason: "$_id.reason",
                                cancelCount: 1,
                                orderIds: 1,
                                _id: 0
                            }
                        },
                        { $sort: { cancelCount: -1 } }
                    ],
                    // PRO: Golden Window
                    goldenWindowRaw: [
                        { $match: { cancelOrder: { $ne: true }, segment: "Loyal Customers" } },
                        { $sort: { createdAt: 1 } },
                        {
                            $group: {
                                _id: "$userId",
                                purchases: { $push: "$createdAt" }
                            }
                        }
                    ]
                }
            }
        ]);

        const data = aggregationResult[0];

        // 3. Post-Process Golden Window Average
        let totalGoldenDays = 0;
        let goldenCount = 0;
        data.goldenWindowRaw.forEach(user => {
            if (user.purchases.length >= 2) {
                const diffMs = new Date(user.purchases[1]) - new Date(user.purchases[0]);
                totalGoldenDays += diffMs / (1000 * 60 * 60 * 24);
                goldenCount++;
            }
        });
        const goldenWindowAverage = goldenCount > 0 ? (totalGoldenDays / goldenCount).toFixed(1) : 0;
        delete data.goldenWindowRaw; // Clean up payload
        data.goldenWindow = goldenWindowAverage;

        // 4. Pro Module: Churn Warning (At Risk Contacts)
        const atRiskIds = rfmData.filter(s => s.segment === "At Risk").map(s => s.userId);
        const atRiskUsers = await User.find({ userId: { $in: atRiskIds } }, 'email username phone').exec();
        data.churnWarningEmails = atRiskUsers;

        // 5. Pro Module: Inventory Deadwood vs Heroes
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        
        const recentSales = await OrderItem.aggregate([
            {
                $lookup: {
                    from: "orders",
                    localField: "orderId",
                    foreignField: "_id",
                    as: "orderData"
                }
            },
            { $unwind: "$orderData" },
            { $match: { "orderData.createdAt": { $gte: last30Days }, "orderData.cancelOrder": { $ne: true } } },
            {
                $group: {
                    _id: "$bookId",
                    sold: { $sum: "$quantity" }
                }
            }
        ]);

        const recentSalesMap = {};
        recentSales.forEach(s => recentSalesMap[s._id.toString()] = s.sold);

        const inventoryRecords = await Book.aggregate([
            {
                $lookup: {
                    from: "inventories",
                    localField: "_id",
                    foreignField: "bookId",
                    as: "inv"
                }
            },
            { $unwind: "$inv" },
            {
                $project: {
                    title: 1,
                    stock: "$inv.stock"
                }
            }
        ]);

        const heroes = [];
        const deadwood = [];
        inventoryRecords.forEach(book => {
            const soldInt = recentSalesMap[book._id.toString()] || 0;
            if (soldInt >= 5 && book.stock <= 10) {
                heroes.push({ title: book.title, stock: book.stock, soldLast30: soldInt });
            } else if (soldInt === 0 && book.stock >= 20) {
                deadwood.push({ title: book.title, stock: book.stock, soldLast30: soldInt });
            }
        });

        data.inventoryHealth = { heroes, deadwood };

        // Return final payload
        res.status(200).json(data);
    } catch (error) {
        console.error("Advanced Intelligence Generation Error:", error);
        res.status(500).json({ message: "Failed to generate intelligence report." });
    }
};

module.exports = {
    getAdvancedIntelligence
};
