const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Book = require('../src/books/book.model');

async function reconcile() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB");

        const result = await Book.updateMany(
            {},
            { $set: { "inventory.reservedQuantity": 0 } }
        );

        console.log(`Reconciliation complete. Reset reservedQuantity to 0 for ${result.modifiedCount} books.`);
        process.exit(0);
    } catch (error) {
        console.error("Reconciliation failed:", error);
        process.exit(1);
    }
}

reconcile();
