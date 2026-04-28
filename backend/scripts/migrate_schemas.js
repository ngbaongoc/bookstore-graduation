const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Book = require('../src/books/book.model');
const Inventory = require('../src/inventory/inventory.model');
const Order = require('../src/orders/order.model');
const OrderItem = require('../src/orders/orderItem.model');

async function migrate() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB...");

        // 1. Migrate Inventory
        console.log("Migrating internal book inventories to Inventory collection...");
        const books = await Book.find().lean();
        for (const book of books) {
            if (book.inventory) {
                const existing = await Inventory.findOne({ bookId: book._id }).lean();
                if (!existing) {
                    await new Inventory({
                        bookId: book._id,
                        inHouseQuantity: book.inventory.inHouseQuantity,
                        reservedQuantity: book.inventory.reservedQuantity,
                        binLocation: book.inventory.binLocation,
                    }).save();
                }
                
                // Remove the nested inventory from the Book document
                await Book.collection.updateOne(
                    { _id: book._id },
                    { $unset: { inventory: "" } }
                );
            }
        }
        console.log(`Migrated ${books.length} books.`);

        // 2. Migrate Orders & OrderItems
        console.log("Migrating orders to flat format and extracting OrderItems...");
        const orders = await Order.find().lean();
        for (const order of orders) {
            let updateData = {};
            let unsetData = {};

            // Flatten Shipping Address
            if (order.shippingAddress) {
                updateData.shippingStreet = order.shippingAddress.street;
                updateData.shippingCity = order.shippingAddress.city;
                updateData.shippingCountry = order.shippingAddress.country;
                updateData.shippingState = order.shippingAddress.state;
                updateData.shippingZipcode = order.shippingAddress.zipcode;
                unsetData.shippingAddress = "";
            }

            // Flatten stage dates
            if (order.stageDates) {
                updateData.stagePending = order.stageDates.Pending || order.stageDates.pending;
                updateData.stageProcessing = order.stageDates.Processing || order.stageDates.processing;
                updateData.stageReadyToPickUp = order.stageDates["Ready to pick up"];
                updateData.stagePickedUp = order.stageDates["Picked up"];
                updateData.stageDelivery = order.stageDates.Delivery;
                updateData.stageDelivered = order.stageDates.Delivered;
                unsetData.stageDates = "";
            }

            // Flatten cancel requests
            if (order.cancelRequest) {
                updateData.cancelRequested = order.cancelRequest.requested;
                updateData.cancelReason = order.cancelRequest.reason;
                updateData.cancelRequestedAt = order.cancelRequest.requestedAt;
                updateData.cancelStatus = order.cancelRequest.status;
                unsetData.cancelRequest = "";
            }

            // Extract Order Items
            if (order.productIds && Array.isArray(order.productIds)) {
                for (const item of order.productIds) {
                    const existing = await OrderItem.findOne({ orderId: order._id, bookId: item.productId });
                    if (!existing) {
                        await new OrderItem({
                            orderId: order._id,
                            bookId: item.productId,
                            quantity: item.quantity
                        }).save();
                    }
                }
                unsetData.productIds = "";
            }

            // Apply DB updates
            if (Object.keys(updateData).length > 0) {
                await Order.collection.updateOne({ _id: order._id }, { $set: updateData });
            }
            if (Object.keys(unsetData).length > 0) {
                await Order.collection.updateOne({ _id: order._id }, { $unset: unsetData });
            }
        }
        console.log(`Migrated ${orders.length} orders.`);

        console.log("Migration completed successfully.");
        process.exit(0);

    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
