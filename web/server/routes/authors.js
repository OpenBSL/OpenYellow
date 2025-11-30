const express = require('express');
const router = express.Router();
const authorsController = require('../controllers/authorsController');

// GET /api/authors - Get authors
router.get('/', authorsController.getAuthors);

// GET /api/authors/:name - Get author by name
router.get('/:name', authorsController.getAuthorByName);

module.exports = router;
