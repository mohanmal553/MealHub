const User = require('../models/User');
const { inMemStudents, generateId } = require('../utils/inMemoryStore');

// @desc    Get all hostel members
// @route   GET /api/students
const getStudents = async (req, res) => {
  try {
    const dbStudents = await User.find({ role: 'student' }).select('-password').sort({ roomNumber: 1, name: 1 });
    return res.json(dbStudents || []);
  } catch (err) {
    console.error('Error fetching members from DB:', err);
  }

  res.json(inMemStudents);
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
      name,
      email: cleanEmail,
      password: password,
      roomNumber: roomNumber || '',
      phone: phone || '',
      role: 'student'
    });

    console.log(`✅ Member created in DB: ${name} (${cleanEmail})`);
    return res.status(201).json(newStudent);
  } catch (err) {
    console.error('Error creating member in DB:', err);
  }

  const newMemStudent = {
    _id: 'st_' + generateId(),
    name,
    email: cleanEmail,
    roomNumber: roomNumber || '',
    phone: phone || '',
    role: 'student'
  };

  inMemStudents.push(newMemStudent);
  res.status(201).json(newMemStudent);
};

// @desc    Update member profile & optional password
// @route   PUT /api/students/:id
const updateStudent = async (req, res) => {
  const { name, email, roomNumber, phone, password } = req.body;
  const studentId = req.params.id;

  try {
    const student = await User.findById(studentId);
    if (student) {
      if (name) student.name = name;
      if (email) student.email = email.toLowerCase().trim();
      if (roomNumber !== undefined) student.roomNumber = roomNumber;
      if (phone !== undefined) student.phone = phone;
      if (password && password.trim() !== '') {
        student.password = password; // Pre-save hook will hash password
      }

      const updated = await student.save();
      console.log(`✅ Member updated in DB: ${studentId}`);
      return res.json(updated);
    }
  } catch (err) {
    console.error('Error updating member in DB:', err);
  }

  const idx = inMemStudents.findIndex(s => s._id === studentId);
  if (idx !== -1) {
    if (name) inMemStudents[idx].name = name;
    if (email) inMemStudents[idx].email = email.toLowerCase().trim();
    if (roomNumber !== undefined) inMemStudents[idx].roomNumber = roomNumber;
    if (phone !== undefined) inMemStudents[idx].phone = phone;
    return res.json(inMemStudents[idx]);
  }

  res.status(404).json({ message: 'Member record not found' });
};

// @desc    Delete member
// @route   DELETE /api/students/:id
const deleteStudent = async (req, res) => {
  const studentId = req.params.id;

  try {
    const student = await User.findById(studentId);
    if (student) {
      await User.findByIdAndDelete(studentId);
      console.log(`✅ Member deleted from DB: ${studentId}`);
      return res.json({ message: 'Member deleted' });
    }
  } catch (err) {
    console.error('Error deleting member from DB:', err);
  }

  const idx = inMemStudents.findIndex(s => s._id === studentId);
  if (idx !== -1) {
    inMemStudents.splice(idx, 1);
    return res.json({ message: 'Member deleted' });
  }

  res.status(404).json({ message: 'Member not found' });
};

module.exports = {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent
};
