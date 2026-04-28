const express = require('express');
const router = express.Router();
const { adminLogin, registerAdmin, getRFMReport, composeSendEmail } = require('./admin.controller');
const { getAdvancedIntelligence } = require('./intelligence.controller');

// Advanced Sales Intelligence
router.get('/intelligence', getAdvancedIntelligence);

// Admin authentication
router.post('/login', adminLogin);

// Staff registration
router.post('/register', registerAdmin);
// RFM Analysis report
router.get('/rfm-report', getRFMReport);
// Send email
router.post('/send-email', composeSendEmail);

module.exports = router;
