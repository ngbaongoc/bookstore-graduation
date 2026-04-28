const express = require('express');
const router = express.Router();
const verifyAdminToken = require('../middleware/verifyAdminToken');
const {
  adjustStock,
  adjustBinLocation,
  getAlerts
} = require('./inventory.controller');

// Inventory routes for E-Logistics dashboard
router.put('/adjust/:id', verifyAdminToken, adjustStock);
router.put('/adjust-bin/:id', verifyAdminToken, adjustBinLocation);
router.get('/alerts', verifyAdminToken, getAlerts);

module.exports = router;
