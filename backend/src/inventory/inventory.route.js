const express = require('express');
const router = express.Router();
const verifyAdminToken = require('../middleware/verifyAdminToken');
const {
  adjustStock,
  confirm3PLPickup,
  packOrder,
  getLogs
} = require('./inventory.controller');

// Inventory routes for E-Logistics dashboard
router.put('/adjust/:id', verifyAdminToken, adjustStock);
router.post('/handover/:id', verifyAdminToken, confirm3PLPickup);
router.post('/pack/:id', verifyAdminToken, packOrder);
router.get('/logs', verifyAdminToken, getLogs);

module.exports = router;
