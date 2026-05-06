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
  summary: {
    type: String,
  },
  moods: {
    type: [String],
    default: [],
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
  },
  moodPlaylistUrl: {
    type: String, // Spotify or YouTube link
    default: ""
  },
  cinemaLink: {
    type: String, // Link to movie or trailer
    default: ""
  },
  cinemaComparison: {
    type: String, // A short note comparing book and movie
    default: ""
  },
  featuredQuote: {
    type: String, // A core quote for "Quote Art" feature
    default: ""
  }
}, {
  timestamps: true,
  collection: 'books',
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
