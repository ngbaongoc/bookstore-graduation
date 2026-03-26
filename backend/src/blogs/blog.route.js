const express = require('express');
const router = express.Router();
const { getAllBlogs, getBlogById, createBlog, deleteBlog } = require('./blog.controller');
const verifyAdminToken = require('../middleware/verifyAdminToken');

// Public routes
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);

// Admin-only routes (protected)
router.post('/create-blog', verifyAdminToken, createBlog);
router.delete('/:id', verifyAdminToken, deleteBlog);

module.exports = router;
