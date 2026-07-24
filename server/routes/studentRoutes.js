const express = require('express');
const router = express.Router();
const { getStudents, addStudent, updateStudent, deleteStudent } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getStudents);
router.post('/', addStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

module.exports = router;
