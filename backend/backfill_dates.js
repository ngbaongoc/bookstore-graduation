const { MongoClient } = require('mongodb');
require('dotenv').config();

const STAGES = ['Pending', 'Processing', 'Ready to pick up', 'Picked up', 'Delivery'];

async function run() {
    const client = new MongoClient(process.env.DB_URL);
    await client.connect();
    const db = client.db();
    
    const orders = await db.collection('orders').find().toArray();
    let count = 0;
    
    for (const order of orders) {
        if (!order.stageDates) continue;

        let needsUpdate = false;
        
        // Find current status index. Support case-variations.
        let status = order.status;
        if (status === 'pending') status = 'Pending';
        if (status === 'completed') status = 'Delivery'; // Safety fallback
        
        const currentIndex = STAGES.indexOf(status);
        if (currentIndex <= 0) continue; // Only process if beyond Pending
        
        const pendingDate = order.stageDates.Pending || order.createdAt;

        // Iterate through all stages up to the current index
        for (let i = 1; i <= currentIndex; i++) {
            const stage = STAGES[i];
            if (!order.stageDates[stage]) {
                order.stageDates[stage] = pendingDate; // Fall back to the original placement date
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            await db.collection('orders').updateOne(
                { _id: order._id },
                { $set: { stageDates: order.stageDates } }
            );
            count++;
        }
    }
    
    console.log(`Backfilled skipped processing dates for ${count} orders in DB.`);
    process.exit(0);
}
run();
