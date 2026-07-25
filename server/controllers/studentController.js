const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');

// @desc    Get all hostel members
// @route   GET /api/students
const getStudents = async (req, res) => {
  try {
    const dbStudents = await User.find({ role: 'student' }).select('-password').sort({ roomNumber: 1, name: 1 });
    return res.json(dbStudents || []);
  } catch (err) {
    console.error('Error fetching members from DB:', err);
    return res.status(500).json({ message: 'Failed to load hostel members from database' });
  }
};

// @desc    Add new member with required password created by Admin
// @route   POST /api/students
const addStudent = async (req, res) => {
  const { name, email, roomNumber, phone, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and login password are required' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'A member with this email already exists' });
    }

    const newStudent = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: password,
      roomNumber: roomNumber ? roomNumber.trim() : '',
      phone: phone ? phone.trim() : '',
      role: 'student'
    });

    console.log(`✅ Member created in DB: ${name} (${cleanEmail})`);

    await logActivity({
      req,
      actionType: 'MEMBER_REGISTERED',
      entityName: 'Member Directory',
      description: `Registered new hostel member "${name}" (${cleanEmail})`,
      oldValue: 'None',
      newValue: `Room: ${roomNumber || 'N/A'}`
    });

    return res.status(201).json(newStudent);
  } catch (err) {
    console.error('Error creating member in DB:', err);
    return res.status(500).json({ message: err.message || 'Failed to save member to database' });
  }
};

// @desc    Update member profile & optional password
// @route   PUT /api/students/:id
const updateStudent = async (req, res) => {
  const { name, email, roomNumber, phone, password } = req.body;
  const studentId = req.params.id;

  try {
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Member record not found' });
    }

    if (name) student.name = name.trim();
    if (email) student.email = email.toLowerCase().trim();
    if (roomNumber !== undefined) student.roomNumber = roomNumber.trim();
    if (phone !== undefined) student.phone = phone.trim();
    if (password && password.trim() !== '') {
      student.password = password; // Pre-save hook will hash password
    }

    const updated = await student.save();
    console.log(`✅ Member updated in DB: ${studentId}`);

    await logActivity({
      req,
      actionType: 'MEMBER_UPDATED',
      entityName: 'Member Directory',
      description: `Updated profile for member "${student.name}"`,
      oldValue: 'Previous Profile',
      newValue: 'Updated Profile'
    });

    return res.json(updated);
  } catch (err) {
    console.error('Error updating member in DB:', err);
    return res.status(500).json({ message: err.message || 'Failed to update member in database' });
  }
};

// @desc    Delete member
// @route   DELETE /api/students/:id
const deleteStudent = async (req, res) => {
  const studentId = req.params.id;

  try {
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await User.findByIdAndDelete(studentId);
    console.log(`✅ Member deleted from DB: ${studentId}`);

    await logActivity({
      req,
      actionType: 'MEMBER_DELETED',
      entityName: 'Member Directory',
      description: `Deleted member account "${student.name}"`,
      oldValue: student.name,
      newValue: 'DELETED'
    });

    return res.json({ message: 'Member deleted' });
  } catch (err) {
    console.error('Error deleting member from DB:', err);
    return res.status(500).json({ message: 'Failed to delete member from database' });
  }
};

module.exports = {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent
};
