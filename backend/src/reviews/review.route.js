const express = require('express');
const router = express.Router();
const { postReview, getReviewsByBookId, getReviewsByUserEmail } = require('./review.controller');

// POST a review
router.post('/post-review', postReview);

// GET reviews for a particular book
router.get('/book/:id', getReviewsByBookId);

// GET reviews by user email
router.get('/user/:email', getReviewsByUserEmail);

module.exports = router;
