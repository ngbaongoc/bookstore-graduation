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
    address: {
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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            required: true,
        }
    ],
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending',
    },
    reminderSent: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
