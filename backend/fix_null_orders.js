const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function run() {
    const client = new MongoClient(process.env.DB_URL);
    await client.connect();
    const db = client.db();
    
    // Fetch all available books to use as replacements
    const books = await db.collection('books').find({}, { projection: { _id: 1 } }).toArray();
    if (books.length === 0) {
        console.log("No books found in the database. Cannot replace.");
        process.exit(1);
    }

    const orders = await db.collection('orders').find().toArray();
    let updatedOrdersCount = 0;
    
    for (const order of orders) {
        if (!order.productIds || !Array.isArray(order.productIds)) continue;
        
        let needsUpdate = false;
        const newProductIds = [];

        for (const prod of order.productIds) {
            // Check if the book still exists
            let bookExists = false;
            
            if (prod && prod.productId) {
                const bookFound = await db.collection('books').findOne({ _id: new ObjectId(prod.productId) });
                if (bookFound) {
                    bookExists = true;
                }
            }

            if (!bookExists) {
                // Pick a random book
                const randomBook = books[Math.floor(Math.random() * books.length)];
                needsUpdate = true;
                newProductIds.push({
                    productId: randomBook._id,
                    quantity: prod.quantity || 1
                });
            } else {
                newProductIds.push(prod);
            }
        }
        
        if (needsUpdate) {
            await db.collection('orders').updateOne(
                { _id: order._id },
                { $set: { productIds: newProductIds } }
            );
            updatedOrdersCount++;
        }
    }
    
    console.log(`Successfully repaired ${updatedOrdersCount} orders by assigning random active books!`);
    process.exit(0);
}
run();
