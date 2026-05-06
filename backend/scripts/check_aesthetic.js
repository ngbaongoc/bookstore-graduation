const mongoose = require('mongoose');
const Book = require('../src/books/book.model');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const checkAesthetic = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        const books = await Book.find({ moodPlaylistUrl: { $exists: true, $ne: "" } }, 'title category moodPlaylistUrl cinemaLink featuredQuote').lean();
        console.log("Books with aesthetic data:", books);
        
        // Let's also check all available titles to see what we can update if none were found
        const allBooks = await Book.find({}, 'title category').lean();
        console.log("Sample of available books (first 5):", allBooks.slice(0, 5));
        
        mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkAesthetic();
