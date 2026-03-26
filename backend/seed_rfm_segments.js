const mongoose = require('mongoose');
const User = require('./src/users/user.model');
const Order = require('./src/orders/order.model');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const segmentsData = [
  { segment: "Champions", name: "Jason Agatha", email: "jason.agatha@gmail.com", logic: { recencyDays: 2, numOrders: 6, totalSpend: 3000000 } },
  { segment: "Loyal Customers", name: "Robert Green", email: "robert.green@gmail.com", logic: { recencyDays: 45, numOrders: 6, totalSpend: 2500000 } },
  { segment: "Potential Loyalist", name: "Emily Chen", email: "emily.chen@yahoo.com", logic: { recencyDays: 15, numOrders: 3, totalSpend: 800000 } },
  { segment: "New Customers", name: "Michael Wong", email: "michael.wong@outlook.com", logic: { recencyDays: 0, numOrders: 1, totalSpend: 150000 } },
  { segment: "Promising", name: "Sarah Smith", email: "sarah.smith@gmail.com", logic: { recencyDays: 40, numOrders: 1, totalSpend: 150000 } },
  { segment: "Needs Attention", name: "David Johnson", email: "david.johnson@hotmail.com", logic: { recencyDays: 45, numOrders: 2, totalSpend: 750000 } },
  { segment: "About to Sleep", name: "Jessica Brown", email: "jessica.brown@gmail.com", logic: { recencyDays: 90, numOrders: 2, totalSpend: 300000 } },
  { segment: "At Risk", name: "Chris Davis", email: "chris.davis@yahoo.com", logic: { recencyDays: 200, numOrders: 4, totalSpend: 1500000 } },
  { segment: "Can't Lose Them", name: "Amanda Wilson", email: "amanda.wilson@gmail.com", logic: { recencyDays: 360, numOrders: 6, totalSpend: 2500000 } },
  { segment: "Hibernating", name: "Matthew Taylor", email: "matthew.taylor@outlook.com", logic: { recencyDays: 150, numOrders: 1, totalSpend: 150000 } },
  { segment: "Lost", name: "Jennifer Thomas", email: "jennifer.thomas@gmail.com", logic: { recencyDays: 400, numOrders: 1, totalSpend: 150000 } }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB.");

        // Clear previous seed data
        const oldPrefixUsers = await User.find({ userId: { $regex: `^rfm_test_` } });
        const oldUserIds = oldPrefixUsers.map(u => u.userId);
        const newSeedUserIds = Array.from({length: 11}, (_, i) => String(990001 + i));
        
        await User.deleteMany({ userId: { $in: [...oldUserIds, ...newSeedUserIds] } });
        await Order.deleteMany({ userId: { $in: [...oldUserIds, ...newSeedUserIds] } });
        console.log(`Cleared previous seed data.`);

        const hashedPassword = await bcrypt.hash("password123", 10);
        const baseDate = new Date("2026-03-25T12:00:00Z");

        const jsonOutput = [];

        for (let i = 0; i < segmentsData.length; i++) {
            const data = segmentsData[i];
            const userId = String(990001 + i);
            const email = data.email;
            const phone = `+84999${String(i).padStart(6, '0')}`;

            // Create User Document
            const userDoc = new User({
                username: data.name,
                userId: userId,
                email: email,
                password: hashedPassword,
                phone: phone,
                role: 'user'
            });
            await userDoc.save();

            const userToExport = {
                userId: userDoc.userId,
                username: userDoc.username,
                email: userDoc.email
            };

            // Create Orders
            const ordersToCreate = [];
            const exportOrders = [];
            const { recencyDays, numOrders, totalSpend } = data.logic;
            
            const spendPerOrder = Math.floor(totalSpend / numOrders);
            const remainder = totalSpend % numOrders;
            
            for (let j = 0; j < numOrders; j++) {
                const daysAgo = j === 0 ? recencyDays : recencyDays + (j * 10); 
                const orderDate = new Date(baseDate.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
                
                const productId = new mongoose.Types.ObjectId();
                const totalPrice = j === 0 ? spendPerOrder + remainder : spendPerOrder;

                ordersToCreate.push({
                    _id: new mongoose.Types.ObjectId(),
                    name: data.name,
                    email: email,
                    phone: phone,
                    address: {
                        street: "123 Seed St",
                        city: "Seed City",
                        country: "Vietnam",
                        state: "HCM",
                        zipcode: "700000"
                    },
                    totalPrice: totalPrice,
                    productIds: [productId],
                    status: 'completed',
                    userId: userId,
                    createdAt: orderDate,
                    updatedAt: orderDate,
                    reminderSent: false
                });

                // Simplified representation for the output requirement
                exportOrders.push({
                    userId: userId,
                    totalPrice: totalPrice,
                    createdAt: orderDate,
                    productIds: [productId.toString()]
                });
            }

            if (ordersToCreate.length > 0) {
                // Use native driver insertMany to avoid Mongoose createdAt override
                await Order.collection.insertMany(ordersToCreate);
            }
            console.log(`Generated ${data.segment} - Added exactly ${numOrders} orders totaling ${totalSpend} VND.`);

            jsonOutput.push({
                user: userToExport,
                orders: exportOrders
            });
        }

        console.log("Seed completed successfully.");
        
        // As requested by user, printing the JSON array with all the generated Users and Orders
        const fs = require('fs');
        fs.writeFileSync('rfm_generated_data.json', JSON.stringify(jsonOutput, null, 2));
        console.log("JSON export saved to rfm_generated_data.json");

        process.exit(0);

    } catch (err) {
        console.error("Error seeding data:", err);
        process.exit(1);
    }
};

seedData();
