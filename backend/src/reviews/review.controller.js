const Review = require('./review.model');

const postReview = async (req, res) => {
    try {
        const { bookId, userId, email, rating, comment } = req.body;

        const newReview = new Review({
            bookId,
            userId,
            email: email || '',
            rating,
            comment
        });

        const savedReview = await newReview.save();
        res.status(201).json({ message: "Review posted successfully", review: savedReview });
    } catch (error) {
        console.error("Error posting review", error);
        res.status(500).json({ message: "Failed to post review" });
    }
};

const getReviewsByBookId = async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await Review.find({ bookId: id }).sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching reviews", error);
        res.status(500).json({ message: "Failed to fetch reviews" });
    }
};

module.exports = {
    postReview,
    getReviewsByBookId
};
