const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Book = require('../src/books/book.model');
const Inventory = require('../src/inventory/inventory.model');
const Order = require('../src/orders/order.model');
const OrderItem = require('../src/orders/orderItem.model');
const User = require('../src/users/user.model');

function jsonToCsv(data) {
    if (!data || !data.length) return '';
    const keys = Object.keys(data[0]).filter(k => k !== '__v'); // exclude Mongoose version key
    const header = keys.join(',');
    const rows = data.map(obj => {
        return keys.map(k => {
            let val = obj[k];
            if (val === undefined || val === null) val = '';
            // Convert objects/dates to string safely
            let strVal = val instanceof Date ? val.toISOString() : 
                         val.toString ? val.toString() : String(val);
            // Escape quotes inside
            strVal = strVal.replace(/"/g, '""');
            return `"${strVal}"`;
        }).join(',');
    });
    return [header, ...rows].join('\n');
}

async function exportCSV() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB...");
        
        const outputDir = path.join(__dirname, '../exports');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        console.log("Exporting Users...");
        const users = await User.find().lean();
        fs.writeFileSync(path.join(outputDir, 'users.csv'), jsonToCsv(users));

        console.log("Exporting Books...");
        const books = await Book.find().lean();
        fs.writeFileSync(path.join(outputDir, 'books.csv'), jsonToCsv(books));

        console.log("Exporting Inventory...");
        const inventory = await Inventory.find().lean();
        fs.writeFileSync(path.join(outputDir, 'inventories.csv'), jsonToCsv(inventory));

        console.log("Exporting Orders...");
        const orders = await Order.find().lean();
        fs.writeFileSync(path.join(outputDir, 'orders.csv'), jsonToCsv(orders));

        console.log("Exporting OrderItems...");
        const orderItems = await OrderItem.find().lean();
        fs.writeFileSync(path.join(outputDir, 'order_items.csv'), jsonToCsv(orderItems));

        console.log("All tables successfully exported to /backend/exports/");
        process.exit(0);

    } catch (error) {
        console.error("Export failed:", error);
        process.exit(1);
    }
}

exportCSV();
