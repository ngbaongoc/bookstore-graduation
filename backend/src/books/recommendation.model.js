const mongoose = require('mongoose');

const recommendationRuleSchema = new mongoose.Schema({
    base_book_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
        unique: true,
    },
    recommendations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
    }]
}, {
    timestamps: true,
    collection: 'recommendationrules'
});

const RecommendationRule = mongoose.model('RecommendationRule', recommendationRuleSchema);
module.exports = RecommendationRule;
