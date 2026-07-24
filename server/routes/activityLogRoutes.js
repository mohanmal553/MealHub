const express = require('express');
const router = express.Router();
const { getActivityLogs, createActivityLog } = require('../controllers/activityLogController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getActivityLogs);
router.post('/', createActivityLog);

module.exports = router;
