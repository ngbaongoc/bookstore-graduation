const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('./src/orders/order.model');
const Book = require('./src/books/book.model');

mongoose.connect(process.env.DB_URL).then(async () => {
    console.log("Connected to DB");
    const order = await Order.findOne().populate('productIds.productId');
    console.log(JSON.stringify(order, null, 2));
    process.exit(0);
});
