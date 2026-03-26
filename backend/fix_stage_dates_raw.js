const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
    const client = new MongoClient(process.env.DB_URL);
    await client.connect();
    const db = client.db();
    
    const orders = await db.collection('orders').find().toArray();
    let count = 0;
    
    for (const order of orders) {
        if (!order.stageDates || !order.stageDates.Pending) {
            await db.collection('orders').updateOne(
                { _id: order._id },
                { $set: { "stageDates": { Pending: order.createdAt, Processing: null, "Ready to pick up": null, "Picked up": null, Delivery: null } } }
            );
            count++;
        }
    }
    
    console.log(`Physically wrote historical stageDates for ${count} orders in DB.`);
    process.exit(0);
}
run();
