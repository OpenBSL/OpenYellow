const express = require('express');
const router = express.Router();
const reposController = require('../controllers/reposController');

// GET /api/repos/stats - Get statistics (must be before /:id)
router.get('/stats', reposController.getStatistics);

// GET /api/repos/filters - Get filter options (must be before /:id)
router.get('/filters', reposController.getFilterOptions);

// GET /api/repos - Get repositories with filters
router.get('/', reposController.getRepositories);

// GET /api/repos/:id - Get repository by ID
router.get('/:id', reposController.getRepositoryById);

module.exports = router;
