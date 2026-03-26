const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('./src/orders/order.model');
const Book = require('./src/books/book.model');

mongoose.connect(process.env.DB_URL).then(async () => {
    const orders = await Order.find().populate('productIds.productId').sort({ createdAt: -1 }).limit(10);
    console.log(JSON.stringify(orders.map(o => o.productIds), null, 2));
    process.exit(0);
});
