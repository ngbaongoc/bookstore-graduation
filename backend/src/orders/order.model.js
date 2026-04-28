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
    shippingStreet: String,
    shippingCity: String,
    shippingCountry: String,
    shippingState: String,
    shippingZipcode: String,
    totalPrice: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Ready to pick up', 'Picked up', 'Delivery', 'Delivered'],
        default: 'Pending',
    },
    stagePending: { type: Date, default: Date.now },
    stageProcessing: { type: Date, default: null },
    stageReadyToPickUp: { type: Date, default: null },
    stagePickedUp: { type: Date, default: null },
    stageDelivery: { type: Date, default: null },
    stageDelivered: { type: Date, default: null },
    reminderSent: {
        type: Boolean,
        default: false,
    },
    cancelOrder: {
        type: Boolean,
        default: false,
    },
    cancelRequested: { type: Boolean, default: false },
    cancelReason: { type: String, default: null },
    cancelRequestedAt: { type: Date, default: null },
    cancelStatus: { type: String, enum: ['pending', 'approved', 'disapproved'], default: 'pending' },

    userId: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
