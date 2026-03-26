const express = require('express');
const router = express.Router();
const { adminLogin, registerAdmin, getRFMReport } = require('./admin.controller');

// Admin authentication
router.post('/login', adminLogin);

// Staff registration
router.post('/register', registerAdmin);
+
+// RFM Analysis report
+router.get('/rfm-report', getRFMReport);

module.exports = router;
