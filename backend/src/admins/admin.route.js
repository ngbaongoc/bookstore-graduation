const express = require('express');
const router = express.Router();
const { adminLogin, registerAdmin, getRFMReport, composeSendEmail, triggerWrappedCampaign, getWrappedPreview, getMysteryPreview } = require('./admin.controller');
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
// Manually trigger Reader's Wrapped campaign
router.post('/trigger-wrapped', triggerWrappedCampaign);
// Get personalized Wrapped HTML preview for a user
router.get('/wrapped-preview/:userId', getWrappedPreview);
// Get personalized Mystery Book Date HTML preview for a user
router.get('/mystery-preview/:userId', getMysteryPreview);

module.exports = router;
