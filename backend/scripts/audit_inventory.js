const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Order = require('../src/orders/order.model');
const Book = require('../src/books/book.model');

async function audit() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB");

        // 1. Check for non-delivered/non-cancelled orders
        const activeOrders = await Order.find({ 
            status: { $ne: 'Delivered' },
            cancelOrder: { $ne: true }
        });
        
        console.log(`Active (non-delivered, non-cancelled) orders: ${activeOrders.length}`);
        
        const expectedReservations = {};
        for (const order of activeOrders) {
            for (const item of order.productIds) {
                const bookId = item.productId.toString();
                expectedReservations[bookId] = (expectedReservations[bookId] || 0) + item.quantity;
            }
        }

        // 2. Compare with current inventory
        const allBooks = await Book.find({});
        console.log("\n--- Discrepancy Report ---");
        let discrepanciesFound = 0;
        
        for (const book of allBooks) {
            const actual = book.inventory?.reservedQuantity || 0;
            const expected = expectedReservations[book._id.toString()] || 0;
            
            if (actual !== expected) {
                console.log(`Book: ${book.title} (ISBN: ${book.isbn})`);
                console.log(`  - Current Reserved: ${actual}`);
                console.log(`  - Expected Reserved: ${expected}`);
                discrepanciesFound++;
            }
        }
        
        if (discrepanciesFound === 0) {
            console.log("No discrepancies found! (Which is weird if you see non-zero in UI)");
        } else {
            console.log(`\nFound ${discrepanciesFound} books with out-of-sync reservations.`);
        }

        process.exit(0);
    } catch (error) {
        console.error("Audit failed:", error);
        process.exit(1);
    }
}

audit();
