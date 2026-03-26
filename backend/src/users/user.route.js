const express = require('express');
const router = express.Router();
const { registerUser, getUserProfile, updateUserProfile, createOrUpdateProfile, getUsers, deleteUser, sendVouchers } = require('./user.controller');

// User profile
router.get('/profile/:email', getUserProfile);
router.put('/profile/:email', updateUserProfile);
router.post('/sync-profile', createOrUpdateProfile);

// Admin User Management
router.get('/', getUsers);
router.delete('/:id', deleteUser);
router.post('/send-vouchers', sendVouchers);

// Customer registration
router.post('/register', registerUser);

module.exports = router;
