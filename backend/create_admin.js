const mongoose = require('mongoose');
const Admin = require('./src/admins/admin.model');
require('dotenv').config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB");

        // Remove existing admin if needed
        await Admin.deleteOne({ username: 'admin' });

        const newAdmin = new Admin({ 
            username: 'admin', 
            password: 'adminpassword', 
            role: 'admin',
            userId: 'admin001',
            email: 'admin@bookstore.com',
            phone: '1234567890'
        });
        await newAdmin.save();
        console.log("Admin user created successfully!");
        mongoose.disconnect();
    } catch (error) {
        console.error("Error creating admin:", error);
        mongoose.disconnect();
    }
}
createAdmin();
