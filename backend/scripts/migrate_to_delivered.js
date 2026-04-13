const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Order = require('../src/orders/order.model');

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.DB_URL);
        console.log('Connected successfully!');

        const statusesToUpdate = ['Pending', 'Processing', 'Ready to pick up', 'Picked up'];
        
        console.log(`Searching for orders with statuses: ${statusesToUpdate.join(', ')}...`);
        
        const count = await Order.countDocuments({ 
            status: { $in: statusesToUpdate },
            cancelOrder: { $ne: true } 
        });

        if (count === 0) {
            console.log('No orders found in processing stages. Nothing to update.');
            process.exit(0);
        }

        console.log(`Found ${count} orders to update. Starting migration...`);

        const result = await Order.updateMany(
            { 
                status: { $in: statusesToUpdate },
                cancelOrder: { $ne: true } 
            },
            { 
                $set: { 
                    status: 'Delivery',
                    'stageDates.Delivery': new Date()
                }
            }
        );

        console.log(`Migration complete! Successfully updated ${result.modifiedCount} orders.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
