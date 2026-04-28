const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Admin = require('../src/admins/admin.model.js');

async function resetAdmin() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB.");
        
        let admin = await Admin.findOne({ username: 'admin' });
        
        if (admin) {
            admin.password = 'admin123';
            await admin.save();
            console.log("Existing admin password reset to: admin123");
        } else {
            admin = new Admin({
                username: 'admin',
                password: 'admin123',
                email: 'admin@admin.com',
                userId: 'admin_001',
                phone: '0000000000',
                role: 'admin'
            });
            await admin.save();
            console.log("New admin created with username: admin and password: admin123");
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

resetAdmin();
