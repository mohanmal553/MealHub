const express = require('express');
const router = express.Router();
const { getMealsByMonth, toggleMealStatus, bulkToggleMeals, getMyMealHistory } = require('../controllers/mealController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getMealsByMonth);
router.get('/my-history', getMyMealHistory);
router.post('/toggle', toggleMealStatus);
router.post('/bulk-toggle', bulkToggleMeals);

module.exports = router;
