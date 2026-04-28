const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Book = require('../src/books/book.model');

async function repair() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.DB_URL);
        
        // Fetch all books (to fix all of them, not just the new ones)
        const books = await Book.find({});
        
        console.log(`Found ${books.length} books. Updating to Open Library Covers API...`);
        
        for (const book of books) {
            // Open Library Covers API is open source and reliable
            // We use the ISBN to get the medium-sized cover
            book.thumbnail = `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`;
            await book.save();
            console.log(`Updated thumbnail for: ${book.title} (ISBN: ${book.isbn})`);
        }
        
        console.log('Open source thumbnail repair completed!');
    } catch (error) {
        console.error('Error repairing data:', error);
    } finally {
        await mongoose.connection.close();
    }
}

repair();
