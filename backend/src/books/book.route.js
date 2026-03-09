const express = require('express');
const router = express.Router();
const { postABook, getAllBooks, getSingleBook, UpdateBook, deleteABook, addReview } = require('./book.controller');

// Post a book: submit something from frontend to db
router.post('/create-book', postABook);

// get all books
router.get('/', getAllBooks);

// get a single book
router.get('/:id', getSingleBook);

// update a book
router.put('/edit/:id', UpdateBook);

// delete a book
router.delete('/:id', deleteABook);

// add a review
router.post('/:id/reviews', addReview);

module.exports = router;