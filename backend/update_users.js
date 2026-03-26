const mongoose = require('mongoose');
const User = require('./src/users/user.model');
require('dotenv').config();

async function updateUsers() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB");
        
        const adminDb = mongoose.connection.db.admin();
        const dbs = await adminDb.listDatabases();
        console.log("Databases in cluster:", dbs.databases.map(db => db.name));

        const targetDbs = ['bookstore', 'test'];
        let allDocs = [];

        for (const dbName of targetDbs) {
            const db = mongoose.connection.useDb(dbName).db;
            const usersCol = db.collection('users');
            const adminsCol = db.collection('admins');

            const users = await usersCol.find({}).toArray();
            const admins = await adminsCol.find({}).toArray();

            console.log(`DB ${dbName}: Found ${users.length} users, ${admins.length} admins.`);
            
            allDocs = [
                ...allDocs, 
                ...users.map(u => ({ doc: u, col: usersCol })), 
                ...admins.map(a => ({ doc: a, col: adminsCol }))
            ];
        }

        for (let entry of allDocs) {
            let user = entry.doc;
            let col = entry.col;
            let updateFields = {};

            if (!user.userId) {
                updateFields.userId = `user_${user.username.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
            }

            if (!user.email) {
                updateFields.email = `${user.username.toLowerCase().replace(/\s+/g, '')}@placeholder.com`;
            }

            if (!user.phone) {
                updateFields.phone = '0000000000';
            }

            if (Object.keys(updateFields).length > 0) {
                await usersCollection.updateOne({ _id: user._id }, { $set: updateFields });
                console.log(`Updated user document: ${user.username}`);
            }
        }

        console.log("Migration completed successfully!");
        mongoose.disconnect();
    } catch (error) {
        console.error("Error during migration:", error);
        mongoose.disconnect();
    }
}

updateUsers();
