const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  isbn: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  published_year: {
    type: Number,
    required: true,
  },
  num_pages: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  number_of_review: {
    type: Number,
    default: 0,
  },
  average_review_score: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
  collection: 'books',
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
