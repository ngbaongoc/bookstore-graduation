const cron = require('node-cron');
const Order = require('../orders/order.model');
const OrderItem = require('../orders/orderItem.model');
const Inventory = require('../inventory/inventory.model');

const initInventoryLockCron = () => {
    // Run every minute
    cron.schedule('*/1 * * * *', async () => {
        try {
            const timeoutThreshold = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago
            
            // Find orders that are still Pending and not already cancelled
            const expiredOrders = await Order.find({
                status: 'Pending',
                cancelOrder: { $ne: true },
                createdAt: { $lt: timeoutThreshold }
            });

            if (expiredOrders.length > 0) {
                console.log(`Found ${expiredOrders.length} expired pending order(s). Releasing inventory locks...`);

                for (const order of expiredOrders) {
                    // Update order status to cancelled
                    order.cancelOrder = true;
                    order.cancelStatus = 'system_cancelled';
                    order.cancelReason = 'Inventory Lock Timeout (15 minutes exceeded)';
                    order.cancelRequested = false;
                    await order.save();

                    // Revert inventory locks
                    const items = await OrderItem.find({ orderId: order._id }).lean();
                    for (const item of items) {
                        try {
                            await Inventory.findOneAndUpdate(
                                { bookId: item.bookId, reservedQuantity: { $gte: item.quantity } },
                                { 
                                    $inc: { 
                                        reservedQuantity: -item.quantity,
                                        inHouseQuantity: item.quantity,
                                    }
                                }
                            );
                        } catch (invErr) {
                            console.error(`Error reverting inventory for bookId: ${item.bookId} on order: ${order._id}`, invErr);
                        }
                    }
                }
                
                console.log(`Inventory locks released successfully for ${expiredOrders.length} order(s).`);
            }
        } catch (error) {
            console.error('Error in inventory lock cronjob:', error);
        }
    });

    console.log('Inventory Lock Timeout cronjob scheduled (runs every minute).');
};

module.exports = initInventoryLockCron;
