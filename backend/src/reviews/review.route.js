const express = require('express');
const router = express.Router();
const { postReview, getReviewsByBookId } = require('./review.controller');

// POST a review
router.post('/post-review', postReview);

// GET reviews for a particular book
router.get('/book/:id', getReviewsByBookId);

module.exports = router;
