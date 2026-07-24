const express = require('express');
const router = express.Router();
const { getMaintenanceStatus, toggleMaintenanceStatus } = require('../controllers/systemController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/maintenance', getMaintenanceStatus);
router.post('/maintenance', protect, adminOnly, toggleMaintenanceStatus);

module.exports = router;
