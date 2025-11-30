const express = require('express');
const router = express.Router();
const reposController = require('../controllers/reposController');

// GET /api/repos - Get repositories with filters
router.get('/', reposController.getRepositories);

// GET /api/repos/stats - Get statistics
router.get('/stats', reposController.getStatistics);

// GET /api/repos/:id - Get repository by ID
router.get('/:id', reposController.getRepositoryById);

module.exports = router;
