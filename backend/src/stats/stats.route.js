const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('./stats.controller');
const verifyAdminToken = require('../middleware/verifyAdminToken');

// Fetch dashboard statistics (protected)
router.get('/', verifyAdminToken, getDashboardStats);

module.exports = router;
