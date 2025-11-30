const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// GET /api/news - Get news with pagination
router.get('/', newsController.getNews);

// GET /api/news/:id - Get news by ID
router.get('/:id', newsController.getNewsById);

module.exports = router;
