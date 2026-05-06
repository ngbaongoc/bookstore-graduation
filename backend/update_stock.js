require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./src/books/book.model');
const Inventory = require('./src/inventory/inventory.model');

const DB_URL = process.env.DB_URL;

mongoose.connect(DB_URL)
  .then(async () => {
    console.log("Connected to MongoDB");
    const books = await Book.find({});
    console.log(`Found ${books.length} books.`);
    
    let updatedCount = 0;
    for (const book of books) {
      await Inventory.findOneAndUpdate(
        { bookId: book._id },
        { 
          $set: { inHouseQuantity: 100 },
          $setOnInsert: { reservedQuantity: 0, binLocation: "General Shelf" }
        },
        { upsert: true, new: true }
      );
      updatedCount++;
    }
    console.log(`Successfully set stock to 100 for ${updatedCount} books.`);
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
  });
