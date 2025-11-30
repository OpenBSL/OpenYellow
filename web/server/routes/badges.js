const express = require('express');
const router = express.Router();
const badgesController = require('../controllers/badgesController');

// GET /data/badges/:group/:id.json - Get badge JSON for repository
router.get('/:group/:id.json', badgesController.getBadge);

module.exports = router;
