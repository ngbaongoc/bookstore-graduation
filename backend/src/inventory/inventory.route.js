const express = require('express');
const router = express.Router();
const verifyAdminToken = require('../middleware/verifyAdminToken');
const {
  adjustStock,
  getAlerts
} = require('./inventory.controller');

// Inventory routes for E-Logistics dashboard
router.put('/adjust/:id', verifyAdminToken, adjustStock);
router.get('/alerts', verifyAdminToken, getAlerts);

module.exports = router;
