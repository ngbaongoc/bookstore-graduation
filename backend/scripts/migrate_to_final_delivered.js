const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Order = require('../src/orders/order.model');
const Book = require('../src/books/book.model');

async function migrate() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB");

        // Find all orders that are NOT Delivered
        const ordersToUpdate = await Order.find({ status: { $ne: 'Delivered' } });
        console.log(`Found ${ordersToUpdate.length} orders to update.`);

        for (const order of ordersToUpdate) {
            // If they haven't reached 'Delivery' yet, we MUST decrease reserved stock
            // (Orders already in 'Delivery' already had their stock decreased by the new controller logic or previous migration)
            if (!order.stageDates || !order.stageDates.Delivery) {
                console.log(`Decreasing reserved stock for order ${order._id}...`);
                for (const item of order.productIds) {
                    await Book.findByIdAndUpdate(item.productId, {
                        $inc: { "inventory.reservedQuantity": -item.quantity }
                    });
                }
            }

            // Update status and dates
            const now = new Date();
            await Order.findByIdAndUpdate(order._id, {
                $set: {
                    status: 'Delivered',
                    'stageDates.Pending': order.stageDates?.Pending || now,
                    'stageDates.Processing': order.stageDates?.Processing || now,
                    'stageDates.Ready to pick up': order.stageDates?.['Ready to pick up'] || now,
                    'stageDates.Picked up': order.stageDates?.['Picked up'] || now,
                    'stageDates.Delivery': order.stageDates?.Delivery || now,
                    'stageDates.Delivered': now
                }
            });
        }

        console.log(`Migration complete for ${ordersToUpdate.length} orders.`);
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
