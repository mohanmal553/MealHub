const express = require('express');
const router = express.Router();
const { getCalculatedBills, generateMonthlyBills, getMyBill, updateBillStatus } = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/calculate', getCalculatedBills);
router.get('/my-bill', getMyBill);
router.post('/generate', generateMonthlyBills);
router.put('/:studentId/status', updateBillStatus);

module.exports = router;
