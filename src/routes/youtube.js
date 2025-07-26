// src/routes/youtube.js
// This file defines the routes for YouTube-related functionality in the Yottabyte backend.

const express = require('express');
const authMiddleware = require('../middleware/auth');
const { searchVideos } = require('../controllers/youtubeController');

const router = express.Router();

router.get('/search', authMiddleware, searchVideos);

module.exports = router;
