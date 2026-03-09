const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'backend/.env') });

async function checkDB() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to:", mongoose.connection.name);
        console.log("Database Host:", mongoose.connection.host);

        const Book = mongoose.model('Book', new mongoose.Schema({}, { strict: false }), 'books');
        const count = await Book.countDocuments();
        console.log("Total books in collection 'books':", count);

        const latestBook = await Book.findOne().sort({ createdAt: -1 });
        if (latestBook) {
            console.log("Latest book title:", latestBook.title);
            console.log("Latest book _id:", latestBook._id);
        } else {
            console.log("No books found in 'books' collection.");
        }

    } catch (err) {
        console.error("Connection error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

checkDB();
