const mongoose = require('mongoose');

const scheduledEmailSchema = new mongoose.Schema({
    to: { type: String, required: true },
    subject: { type: String, required: true },
    html: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    status: {
        type: String,
        enum: ['pending', 'sending', 'sent', 'failed'],
        default: 'pending'
    },
    error: { type: String }
}, { timestamps: true });

const ScheduledEmail = mongoose.model('ScheduledEmail', scheduledEmailSchema);
module.exports = ScheduledEmail;
