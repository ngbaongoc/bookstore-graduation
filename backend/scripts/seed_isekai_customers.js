const mongoose = require('mongoose');
const Order = require('../src/orders/order.model');
const OrderItem = require('../src/orders/orderItem.model');
const Book = require('../src/books/book.model');
const User = require('../src/users/user.model');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const seedIsekaiCustomers = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to DB...");

        // 1. Find relevant books for each category
        const vnClassics = await Book.find({ author: { $in: ['Nam Cao', 'Thạch Lam', 'Vũ Trọng Phụng'] } }).limit(5);
        const worldClassics = await Book.find({ category: 'Classic Literature' }).limit(5);
        const mysteryBooks = await Book.find({ category: { $regex: /Mystery|Detective/i } }).limit(5);
        const sciFiBooks = await Book.find({ category: { $regex: /Science Fiction|Sci-fi/i } }).limit(5);
        const randomBooks = await Book.find({}).limit(25);

        const customers = [
            {
                name: "Nguyễn Tố Uyên",
                email: "touyen.nguyen@example.com",
                phone: "0905888001",
                userId: "880001",
                books: vnClassics,
                targetBadge: "INTELLECTUAL_20TH"
            },
            {
                name: "Lily Joe",
                email: "lily.joe@example.com",
                phone: "0905888002",
                userId: "880002",
                books: worldClassics,
                targetBadge: "RENAISSANCE_NOBLE"
            },
            {
                name: "Lê Hải Nam",
                email: "hainam.le@example.com",
                phone: "0905888003",
                userId: "880003",
                books: mysteryBooks,
                targetBadge: "BAKER_STREET_DETECTIVE"
            },
            {
                name: "Elena Smith",
                email: "elena.smith@example.com",
                phone: "0905888004",
                userId: "880004",
                books: sciFiBooks,
                targetBadge: "GALACTIC_TRAVELER"
            },
            {
                name: "Hoàng Minh Quân",
                email: "minhquan.hoang@example.com",
                phone: "0905888005",
                userId: "880005",
                books: randomBooks,
                targetBadge: "CHRONICLE_KEEPER"
            }
        ];

        // Clean up
        const testUserIds = customers.map(c => c.userId);
        const testEmails = customers.map(c => c.email);
        const testPhones = customers.map(c => c.phone);

        const existingOrders = await Order.find({ userId: { $in: testUserIds } });
        const existingOrderIds = existingOrders.map(o => o._id);
        
        await OrderItem.deleteMany({ orderId: { $in: existingOrderIds } });
        await Order.deleteMany({ userId: { $in: testUserIds } });
        await User.deleteMany({ 
            $or: [
                { userId: { $in: testUserIds } },
                { email: { $in: testEmails } },
                { phone: { $in: testPhones } }
            ]
        });

        console.log("Creating new Isekai Users and Orders with Delivered stages...");
        const hashedPassword = await bcrypt.hash('password123', 10);
        const now = new Date();
        const deliveredDate = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)); // 2 days ago

        for (const customer of customers) {
            // 1. Create User
            await new User({
                username: customer.name,
                email: customer.email,
                userId: customer.userId,
                password: hashedPassword,
                phone: customer.phone,
                role: 'user'
            }).save();

            // 2. Create Order
            const order = await new Order({
                userId: customer.userId,
                name: customer.name,
                email: customer.email,
                address: {
                    city: "Da Nang",
                    country: "Vietnam",
                    state: "DN",
                    zipcode: "550000"
                },
                phone: customer.phone,
                productIds: customer.books.map(b => ({ productId: b._id, quantity: 1 })),
                totalPrice: customer.books.reduce((sum, b) => sum + (b.price || 50000), 0),
                status: 'Delivered',
                stageDelivered: deliveredDate, // Important for RFM Analysis
                createdAt: deliveredDate
            }).save();

            // 3. Create OrderItems
            for (const book of customer.books) {
                await new OrderItem({
                    orderId: order._id,
                    bookId: book._id,
                    quantity: 1,
                    price: book.price || 50000
                }).save();
            }
            
            console.log(`✅ Standardized: ${customer.userId} | ${customer.name} -> ${customer.targetBadge}`);
        }

        console.log("\nData seeded. Now run RFM analysis to update segments.");
        mongoose.disconnect();
    } catch (error) {
        console.error("Error seeding customers:", error);
        process.exit(1);
    }
};

seedIsekaiCustomers();
