const Order = require('../orders/order.model');

const getDashboardStats = async (req, res) => {
    try {
        const { range = 'Month', startDate, endDate } = req.query;
        
        let dateFilter = { cancelOrder: { $ne: true } };
        let datePart;
        let limitPoints = 31;

        // Custom Date Range Handling
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Inclusion of the full end day

            dateFilter.createdAt = { $gte: start, $lte: end };
            
            // Dynamically decide granularity
            const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            if (diffDays <= 2) {
                datePart = { $dateToString: { format: "%H:00", date: "$createdAt" } }; // Hourly
            } else if (diffDays <= 60) {
                datePart = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }; // Daily
            } else {
                datePart = { $dateToString: { format: "%Y-%m", date: "$createdAt" } }; // Monthly
            }
            limitPoints = 100; // Allow more points for custom ranges
        } else {
            // Preset Range Handling
            switch(range) {
                case 'Month':
                    // Handled via startDate/endDate from frontend — this is a fallback
                    const monthStart = new Date();
                    monthStart.setMonth(monthStart.getMonth() - 1);
                    dateFilter.createdAt = { $gte: monthStart };
                    datePart = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
                    limitPoints = 31;
                    break;
                case 'Year':
                    const yearStart = new Date(new Date().getFullYear(), 0, 1);
                    const yearEnd = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);
                    dateFilter.createdAt = { $gte: yearStart, $lte: yearEnd };
                    datePart = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
                    limitPoints = 12;
                    break;
                default:
                    datePart = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
            }
        }

        // 1. Sales Performance (Time-Series)
        const salesPerformance = await Order.aggregate([
            { $match: dateFilter },
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
            { $match: dateFilter },
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

        // 3. Geographic Insights
        const regionStats = await Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: { $ifNull: ["$shippingAddress.city", "Unknown"] },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // 4. Logistics Health (Cancellation Analysis)
        // Build cancelFilter: take date bounds from dateFilter but set cancelOrder: true
        const { cancelOrder: _excluded, ...dateFilterWithoutCancel } = dateFilter;
        const cancelFilter = { ...dateFilterWithoutCancel, cancelOrder: true };

        const cancellationStats = await Order.aggregate([
            { $match: cancelFilter },
            {
                $group: {
                    _id: { $ifNull: ["$cancellationReason", "Other"] },
                    count: { $sum: 1 }
                }
            }
        ]);

        // 5. Value Cards Metrics
        const totalNonCanceled = await Order.countDocuments(dateFilter);      // non-cancelled orders
        const totalCanceled = await Order.countDocuments(cancelFilter);         // cancelled orders
        const totalAllOrders = totalNonCanceled + totalCanceled;
        const cancellationRate = totalAllOrders > 0 ? ((totalCanceled / totalAllOrders) * 100).toFixed(1) : 0;

        // Revenue for the selected period
        const periodRevenueResult = await Order.aggregate([
            { $match: dateFilter },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);


        res.status(200).json({
            salesPerformance,
            topBooks,
            regionStats,
            cancellationStats,
            cards: {
                todayRevenue: periodRevenueResult[0]?.total || 0,
                totalOrders: totalAllOrders,
                cancellationRate
            }
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
};

module.exports = { getDashboardStats };
