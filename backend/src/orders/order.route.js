const express = require('express');
const router = express.Router()
const { createOrder, getOrdersByEmail, getOrdersByUserId, getAllOrders } = require('./order.controller');
const verifyAdminToken = require('../middleware/verifyAdminToken');

// create order endpoint
router.post("/", createOrder);

// get orders by email
router.get("/email/:email", getOrdersByEmail);

// get orders by userId
router.get("/user/:userId", getOrdersByUserId);

// get all orders (admin)
router.get("/", verifyAdminToken, getAllOrders);

module.exports = router;
