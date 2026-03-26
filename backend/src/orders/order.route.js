const express = require('express');
const router = express.Router()
const { createOrder, getOrdersByEmail, getOrdersByUserId, getAllOrders, updateOrderStatus, requestCancelOrder, approveCancelOrder, disapproveCancelOrder } = require('./order.controller');
const verifyAdminToken = require('../middleware/verifyAdminToken');

// create order endpoint
router.post("/", createOrder);

// get orders by email
router.get("/email/:email", getOrdersByEmail);

// get orders by userId
router.get("/user/:userId", getOrdersByUserId);

// get all orders (admin)
router.get("/", verifyAdminToken, getAllOrders);

// update order status (admin)
router.patch("/:id/status", verifyAdminToken, updateOrderStatus);

// cancel request (user)
router.patch("/:id/cancel-request", requestCancelOrder);

// approve cancel (admin)
router.patch("/:id/approve-cancel", verifyAdminToken, approveCancelOrder);

// disapprove cancel (admin)
router.patch("/:id/disapprove-cancel", verifyAdminToken, disapproveCancelOrder);

module.exports = router;
