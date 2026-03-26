const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function run() {
    const client = new MongoClient(process.env.DB_URL);
    await client.connect();
    const db = client.db();
    
    const orders = await db.collection('orders').find().toArray();
    let updatedCount = 0;
    
    for (const order of orders) {
        if (!order.productIds || !Array.isArray(order.productIds)) continue;
        
        let needsUpdate = false;
        const newProductIds = order.productIds.map(prod => {
            // Check for raw strings or ObjectIds
            if (typeof prod === 'string' || prod instanceof ObjectId || prod._bsontype === 'ObjectID') {
                needsUpdate = true;
                return {
                    productId: new ObjectId(prod),
                    quantity: 1
                };
            }
            return prod;
        });
        
        if (needsUpdate) {
            await db.collection('orders').updateOne(
                { _id: order._id },
                { $set: { productIds: newProductIds } }
            );
            updatedCount++;
        }
    }
    
    console.log(`Migrated ${updatedCount} legacy orders.`);
    process.exit(0);
}
run();
