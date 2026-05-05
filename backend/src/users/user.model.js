const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['user'],
        default: 'user'
    },
    rfmCode: {
        type: String,
        default: null
    },
    segment: {
        type: String,
        default: 'No Orders'
    },
    readingGoal: {
        type: Number,
        default: 10
    },
    odysseyTheme: {
        type: String,
        default: 'default'
    },
    odysseyProgresses: {
        type: Map,
        of: {
            currentBookIndex: { type: Number, default: 0 },
            startedAt: { type: Date, default: null },
            completedBooks: [{
                bookIndex: Number,
                reflection: String,
                status: { type: String, enum: ['Completed', 'Pending'], default: 'Completed' },
                completedAt: Date
            }]
        },
        default: {}
    },
}, {
    timestamps: true
})

const User = mongoose.model('User', userSchema);
module.exports = User;
