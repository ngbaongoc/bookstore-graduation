const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    shippingAddress: {
        street: String,
        city: String,
        country: String,
        state: String,
        zipcode: String,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    productIds: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Book',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1,
            }
        }
    ],
    status: {
        type: String,
        enum: ['pending', 'Pending', 'Processing', 'Ready to pick up', 'Picked up', 'Delivery'],
        default: 'Pending',
    },
    stageDates: {
        Pending: { type: Date, default: Date.now },
        Processing: { type: Date, default: null },
        'Ready to pick up': { type: Date, default: null },
        'Picked up': { type: Date, default: null },
        Delivery: { type: Date, default: null },
    },
    reminderSent: {
        type: Boolean,
        default: false,
    },
    cancelOrder: {
        type: Boolean,
        default: false,
    },
    cancelRequest: {
        requested: { type: Boolean, default: false },
        reason: { type: String, default: null },
        requestedAt: { type: Date, default: null },
        status: { type: String, enum: ['pending', 'approved', 'disapproved'], default: 'pending' },
    },
    cancellationReason: {
        type: String,
        default: null,
    },
    userId: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
