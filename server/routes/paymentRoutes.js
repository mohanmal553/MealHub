const express = require('express');
const router = express.Router();
const { getPayments, addPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getPayments);
router.post('/', addPayment);

module.exports = router;
