const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('./src/orders/order.model');

mongoose.connect(process.env.DB_URL).then(async () => {
    const orders = await Order.find();
    let count = 0;
    for (const order of orders) {
        if (!order.stageDates || !order.stageDates.Pending) {
            await Order.updateOne(
                { _id: order._id },
                { $set: { "stageDates.Pending": order.createdAt } }
            );
            count++;
        }
    }
    console.log(`Initialized stageDates for ${count} legacy orders.`);
    process.exit(0);
});
