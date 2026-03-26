const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
    const client = new MongoClient(process.env.DB_URL);
    await client.connect();
    const db = client.db();
    const orders = await db.collection('orders').find().limit(5).toArray();
    console.log(JSON.stringify(orders.map(o => o.productIds), null, 2));
    process.exit(0);
}
run();
