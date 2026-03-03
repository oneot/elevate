const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Define public routes
router.get('/posts', postController.getPublishedPosts);
router.get('/posts/:slug', postController.getPostBySlug);

module.exports = router;
