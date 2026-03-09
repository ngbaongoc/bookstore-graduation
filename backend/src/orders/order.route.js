const express = require('express');
const router = express.Router();
const { createOrder } = require('./order.controller');

// create order endpoint
router.post("/", createOrder);

module.exports = router;
