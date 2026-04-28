const express = require('express');
const router = express.Router();
const { postABook, getAllBooks, getSingleBook, UpdateBook, deleteABook, addReview, importBooks } = require('./book.controller');
const verifyAdminToken = require('../middleware/verifyAdminToken');

// Post a book: submit something from frontend to db
router.post('/create-book', verifyAdminToken, postABook);

// Import books in bulk from CSV
router.post('/import', verifyAdminToken, importBooks);

// get all books
router.get('/', getAllBooks);

// get a single book
router.get('/:id', getSingleBook);

// update a book
router.put('/edit/:id', verifyAdminToken, UpdateBook);

// delete a book
router.delete('/:id', verifyAdminToken, deleteABook);

// add a review
router.post('/:id/reviews', addReview);

module.exports = router;