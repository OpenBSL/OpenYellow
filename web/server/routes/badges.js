const express = require('express');
const router = express.Router();
const badgesController = require('../controllers/badgesController');

// GET /data/badges/:id.svg - Get SVG badge for repository (direct)
router.get('/:id.svg', badgesController.getBadgeSvg);

// GET /data/badges/:group/:id.json - Get badge JSON for repository (shields.io compatibility)
router.get('/:group/:id.json', badgesController.getBadge);

module.exports = router;
