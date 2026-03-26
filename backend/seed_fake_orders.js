const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

/**
 * Seed script: Creates fake delivered orders for users who currently have
 * zero orders with status='Delivery', so they appear in Manage Users with
 * RFM scores and segments.
 * 
 * Idempotent: skips users who already have delivered orders.
 */
async function run() {
    const client = new MongoClient(process.env.DB_URL);
    await client.connect();
    const db = client.db();

    // 1. Get all users
    const users = await db.collection('users').find().toArray();
    console.log(`Found ${users.length} total users.`);

    // 2. Get all books (with prices for realistic totalPrice calculation)
    const books = await db.collection('books').find({}, { projection: { _id: 1, price: 1, title: 1 } }).toArray();
    if (books.length === 0) {
        console.error('No books found in database. Cannot create orders.');
        process.exit(1);
    }
    console.log(`Found ${books.length} books to choose from.`);

    // 3. Find users who already have delivered orders
    const usersWithDelivery = await db.collection('orders').distinct('userId', { status: 'Delivery' });
    const usersWithDeliverySet = new Set(usersWithDelivery);
    console.log(`${usersWithDeliverySet.size} users already have delivered orders.`);

    // 4. Filter to users needing fake orders
    const usersNeedingOrders = users.filter(u => !usersWithDeliverySet.has(u.userId));
    console.log(`${usersNeedingOrders.length} users need fake delivered orders.`);

    if (usersNeedingOrders.length === 0) {
        console.log('All users already have delivered orders. Nothing to do!');
        process.exit(0);
    }

    const now = new Date();
    const ordersToInsert = [];

    for (const user of usersNeedingOrders) {
        // Each user gets 2-4 orders spread over the last 1-90 days
        const numOrders = 2 + Math.floor(Math.random() * 3); // 2, 3, or 4

        for (let i = 0; i < numOrders; i++) {
            // Random delivery date in the last 1-90 days
            const daysAgo = 1 + Math.floor(Math.random() * 90);
            const deliveryDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
            
            // Stage dates working backwards from delivery
            const pickedUpDate = new Date(deliveryDate.getTime() - (1 + Math.random() * 2) * 24 * 60 * 60 * 1000);
            const readyDate = new Date(pickedUpDate.getTime() - (0.5 + Math.random()) * 24 * 60 * 60 * 1000);
            const processingDate = new Date(readyDate.getTime() - (0.5 + Math.random()) * 24 * 60 * 60 * 1000);
            const pendingDate = new Date(processingDate.getTime() - (0.5 + Math.random() * 2) * 24 * 60 * 60 * 1000);

            // Pick 1-3 random books
            const numBooks = 1 + Math.floor(Math.random() * 3);
            const selectedBooks = [];
            const usedIndexes = new Set();
            for (let j = 0; j < numBooks; j++) {
                let idx;
                do { idx = Math.floor(Math.random() * books.length); } while (usedIndexes.has(idx) && usedIndexes.size < books.length);
                usedIndexes.add(idx);
                const qty = 1 + Math.floor(Math.random() * 3); // 1-3 quantity
                selectedBooks.push({
                    productId: books[idx]._id,
                    quantity: qty
                });
            }

            // Calculate total price from actual book prices
            const totalPrice = selectedBooks.reduce((sum, item) => {
                const book = books.find(b => b._id.equals(item.productId));
                return sum + (book ? book.price * item.quantity : 0);
            }, 0);

            const cities = ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hue', 'Can Tho', 'Nha Trang'];
            const streets = ['123 Le Loi', '456 Nguyen Hue', '789 Tran Hung Dao', '101 Hai Ba Trung', '55 Dong Khoi'];

            ordersToInsert.push({
                name: user.username,
                email: user.email,
                phone: user.phone,
                shippingAddress: {
                    street: streets[Math.floor(Math.random() * streets.length)],
                    city: cities[Math.floor(Math.random() * cities.length)],
                    country: 'Vietnam',
                    state: '',
                    zipcode: String(70000 + Math.floor(Math.random() * 10000)),
                },
                totalPrice: Math.round(totalPrice * 100) / 100,
                productIds: selectedBooks,
                status: 'Delivery',
                stageDates: {
                    Pending: pendingDate,
                    Processing: processingDate,
                    'Ready to pick up': readyDate,
                    'Picked up': pickedUpDate,
                    Delivery: deliveryDate,
                },
                reminderSent: false,
                userId: user.userId,
                createdAt: pendingDate,
                updatedAt: deliveryDate,
            });
        }
    }

    // 5. Insert all orders
    const result = await db.collection('orders').insertMany(ordersToInsert);
    console.log(`\n✅ Successfully inserted ${result.insertedCount} fake delivered orders!`);
    
    // Print summary per user
    for (const user of usersNeedingOrders) {
        const userOrders = ordersToInsert.filter(o => o.userId === user.userId);
        const totalSpent = userOrders.reduce((s, o) => s + o.totalPrice, 0);
        console.log(`   ${user.userId} (${user.username}): ${userOrders.length} orders, total $${totalSpent.toFixed(2)}`);
    }

    await client.close();
    process.exit(0);
}

run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
