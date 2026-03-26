const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function fixIndices() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB");

        const User = require('./src/users/user.model');
        
        // Drop the unique index on username if it exists
        try {
            await User.collection.dropIndex("username_1");
            console.log("Dropped unique index on 'username'");
        } catch (e) {
            console.log("Index 'username_1' not found or already dropped");
        }

        // Create unique index on phone
        try {
            await User.collection.createIndex({ phone: 1 }, { unique: true });
            console.log("Created unique index on 'phone'");
        } catch (e) {
            console.log("Failed to create index on 'phone' (maybe duplicates already exist?):", e.message);
        }

        console.log("Index fix completed!");
        process.exit(0);
    } catch (error) {
        console.error("Error fixing indices:", error);
        process.exit(1);
    }
}

fixIndices();
