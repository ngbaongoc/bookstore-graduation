const Order = require('../orders/order.model');
const Book = require('../books/book.model');

const getDashboardStats = async (req, res) => {
    try {
        const { range = 'Month' } = req.query; // Day, Week, Month, Year
        
        let datePart;
        let limitPoints = 30;

        switch(range) {
            case 'Day':
                datePart = { $dateToString: { format: "%H:00", date: "$createdAt" } }; // Hourly for today
                limitPoints = 24;
                break;
            case 'Week':
                datePart = {
                    $switch: {
                        branches: [
                            { case: { $eq: [{ $dayOfWeek: "$createdAt" }, 1] }, then: "Sun" },
                            { case: { $eq: [{ $dayOfWeek: "$createdAt" }, 2] }, then: "Mon" },
                            { case: { $eq: [{ $dayOfWeek: "$createdAt" }, 3] }, then: "Tue" },
                            { case: { $eq: [{ $dayOfWeek: "$createdAt" }, 4] }, then: "Wed" },
                            { case: { $eq: [{ $dayOfWeek: "$createdAt" }, 5] }, then: "Thu" },
                            { case: { $eq: [{ $dayOfWeek: "$createdAt" }, 6] }, then: "Fri" },
                            { case: { $eq: [{ $dayOfWeek: "$createdAt" }, 7] }, then: "Sat" }
                        ],
                        default: "Unknown"
                    }
                };
                limitPoints = 7;
                break;
            case 'Month':
                datePart = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
                limitPoints = 30;
                break;
            case 'Year':
                datePart = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
                limitPoints = 12;
                break;
            default:
                datePart = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        }

        // 1. Sales Performance (Time-Series)
        const salesPerformance = await Order.aggregate([
            { $match: { cancelOrder: { $ne: true } } },
            {
                $group: {
                    _id: datePart,
                    revenue: { $sum: "$totalPrice" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } },
            { $limit: limitPoints }
        ]);

        // 2. Top 5 Most Sold Books
        const topBooks = await Order.aggregate([
            { $match: { cancelOrder: { $ne: true } } },
            { $unwind: "$productIds" },
            {
                $group: {
                    _id: "$productIds.productId",
                    totalUnits: { $sum: "$productIds.quantity" }
                }
            },
            { $sort: { totalUnits: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "books",
                    localField: "_id",
                    foreignField: "_id",
                    as: "bookDetails"
                }
            },
            { $unwind: "$bookDetails" },
            {
                $project: {
                    title: "$bookDetails.title",
                    totalUnits: 1
                }
            }
        ]);

        // 3. Geographic Insights (Most Sold Region)
        const regionStats = await Order.aggregate([
            { $match: { cancelOrder: { $ne: true } } },
            {
                $group: {
                    _id: { $ifNull: ["$shippingAddress.city", { $ifNull: ["$address.city", "Unknown"] }] },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 } // Top 5 cities
        ]);

        // 4. Logistics Health (Cancellation Analysis)
        const cancellationStats = await Order.aggregate([
            { $match: { cancelOrder: true } },
            {
                $group: {
                    _id: { $ifNull: ["$cancellationReason", { $ifNull: ["$cancelRequest.reason", "Other"] }] },
                    count: { $sum: 1 }
                }
            }
        ]);

        // 5. Value Cards
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const todayRevenueResult = await Order.aggregate([
            { $match: { createdAt: { $gte: todayStart }, cancelOrder: { $ne: true } } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        const totalOrders = await Order.countDocuments();
        const canceledOrders = await Order.countDocuments({ cancelOrder: true });
        
        // Active Reserved Units (from Book collection)
        const books = await Book.find({});
        const activeReservedUnits = books.reduce((acc, book) => acc + (book.inventory?.reservedQuantity || 0), 0);

        const cancellationRate = totalOrders > 0 ? ((canceledOrders / totalOrders) * 100).toFixed(1) : 0;

        res.status(200).json({
            salesPerformance,
            topBooks,
            regionStats,
            cancellationStats,
            cards: {
                todayRevenue: todayRevenueResult[0]?.total || 0,
                totalOrders,
                activeReservedUnits,
                cancellationRate
            }
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
};

module.exports = { getDashboardStats };
