const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const User = require('../src/users/user.model');
const Order = require('../src/orders/order.model');
const OrderItem = require('../src/orders/orderItem.model');
const Book = require('../src/books/book.model');

// Connect to MongoDB
mongoose.connect(process.env.DB_URL).then(async () => {
    console.log('Connected to DB');

    // 1. Get some random books to use
    const books = await Book.find().limit(5).lean();
    if (books.length < 2) {
        console.log('Not enough books in DB');
        process.exit(1);
    }

    // --- CREATE "NEEDS ATTENTION" USER ---
    const naUserId = 'test_needs_attention_' + Date.now();
    await User.create({
        email: 'needs_attention@test.com',
        userId: naUserId,
        username: 'Needs Attention Tester',
        password: 'password123',
        phone: '1234567891',
        role: 'user',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
    });

    // Create 3 orders for NA user (mid frequency)
    // Recency should be ~60 days ago (mid recency)
    for (let i = 0; i < 3; i++) {
        const orderDate = new Date(Date.now() - (60 + i * 10) * 24 * 60 * 60 * 1000);
        const order = await Order.create({
            userId: naUserId,
            name: 'Needs Attention Tester',
            email: 'needs_attention@test.com',
            address: { city: 'Test City', country: 'Test Country', state: 'Test State', zipcode: '12345' },
            phone: '1234567890',
            productIds: [books[i % books.length]._id],
            totalPrice: books[i % books.length].price || 100,
            status: 'Delivered',
            stageDelivered: orderDate,
            createdAt: orderDate
        });
        
        await OrderItem.create({
            orderId: order._id,
            bookId: books[i % books.length]._id,
            quantity: 1
        });
    }

    console.log('Created Needs Attention test user');

    // --- CREATE "ABOUT TO SLEEP" USER ---
    const sleepUserId = 'test_about_to_sleep_' + Date.now();
    await User.create({
        email: 'about_to_sleep@test.com',
        userId: sleepUserId,
        username: 'About to Sleep Tester',
        password: 'password123',
        phone: '1234567892',
        role: 'user',
        createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000) // 150 days ago
    });

    // Create 1 order for Sleep user (low frequency)
    // Recency should be ~120 days ago (low recency)
    const sleepOrderDate = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000);
    const sleepOrder = await Order.create({
        userId: sleepUserId,
        name: 'About to Sleep Tester',
        email: 'about_to_sleep@test.com',
        address: { city: 'Test City', country: 'Test Country', state: 'Test State', zipcode: '12345' },
        phone: '1234567890',
        productIds: [books[0]._id],
        totalPrice: books[0].price || 100,
        status: 'Delivered',
        stageDelivered: sleepOrderDate,
        createdAt: sleepOrderDate
    });

    await OrderItem.create({
        orderId: sleepOrder._id,
        bookId: books[0]._id,
        quantity: 1
    });

    console.log('Created About to Sleep test user');

    // Check new segments
    const { getRFMAnalysis } = require('../src/orders/rfm_analysis');
    const rfm = await getRFMAnalysis();
    
    console.log('\n--- NEW RFM SEGMENTS ---');
    const counts = rfm.reduce((acc, r) => {
        acc[r.segment] = (acc[r.segment] || 0) + 1;
        return acc;
    }, {});
    console.log(counts);

    // Specifically check our test users
    const naTest = rfm.find(r => r.userId === naUserId);
    const sleepTest = rfm.find(r => r.userId === sleepUserId);
    
    console.log('\nTest Users Final Segment:');
    console.log('needs_attention@test.com ->', naTest ? naTest.segment : 'Not found');
    console.log('about_to_sleep@test.com ->', sleepTest ? sleepTest.segment : 'Not found');

    process.exit(0);
}).catch(console.error);
