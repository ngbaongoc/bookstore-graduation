const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function migrate() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB");

        const User = require('./src/users/user.model');
        const Order = require('./src/orders/order.model');

        const orders = await Order.find();
        console.log(`Found ${orders.length} orders to check.`);

        for (let order of orders) {
            let user = null;
            
            // 1. Try to find user by MongoDB ID (if userId is an ObjectId or looks like one)
            if (mongoose.Types.ObjectId.isValid(order.userId)) {
                user = await User.findById(order.userId);
            }

            // 2. If not found, try to find user by email (as fallback)
            if (!user) {
                user = await User.findOne({ email: order.email });
            }

            if (user && user.userId) {
                console.log(`Migrating order ${order._id}: Setting userId to ${user.userId}`);
                await Order.updateOne({ _id: order._id }, { $set: { userId: user.userId } });
            } else {
                console.warn(`Could not find a valid 6-digit userId for order ${order._id} (Email: ${order.email})`);
            }
        }

        console.log("Migration completed!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
