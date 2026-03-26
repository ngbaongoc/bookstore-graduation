const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function run() {
    const client = new MongoClient(process.env.DB_URL);
    await client.connect();
    const db = client.db();
    
    const order = await db.collection('orders').findOne({ _id: new ObjectId("69c3fefc9787e5c9bff42fee") });
    console.log(JSON.stringify(order.stageDates, null, 2));
    process.exit(0);
}
run();
