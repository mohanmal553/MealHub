const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'mealhub_jwt_secret_key_2026', {
    expiresIn: '30d'
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const cleanEmail = String(email).toLowerCase().trim();
  const cleanPassword = String(password).trim();

  console.log(`🔑 Login Attempt: email="${cleanEmail}"`);

  // 1. Admin Single Authorized Login Override (mealhub.mohan@gmail.com / admin123)
  if (cleanEmail === 'mealhub.mohan@gmail.com' && cleanPassword === 'admin123') {
    let user;
    try {
      user = await User.findOne({ email: cleanEmail });
      if (!user) {
        user = await User.create({
          name: 'MealHub Admin',
          email: 'mealhub.mohan@gmail.com',
          password: 'admin123',
          role: 'admin',
          roomNumber: 'A-101'
        });
      }
    } catch (err) {
      user = {
        _id: 'admin_1',
        name: 'MealHub Admin',
        email: 'mealhub.mohan@gmail.com',
        role: 'admin',
        roomNumber: 'A-101'
      };
    }

    console.log(`✅ Admin Login Grant Success: ${cleanEmail}`);
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: 'admin',
      roomNumber: user.roomNumber || 'A-101',
      token: generateToken(user._id)
    });
  }

  // 2. Registered Member Account Match
  try {
    const user = await User.findOne({ email: cleanEmail });
    if (user) {
      const isMatch = await user.comparePassword(cleanPassword);
      if (isMatch) {
        console.log(`✅ Member Login Grant Success: ${cleanEmail}`);
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'student',
          roomNumber: user.roomNumber,
          token: generateToken(user._id)
        });
      }
    }
  } catch (err) {
    console.error('Error during member login check:', err);
  }

  return res.status(401).json({ message: 'Invalid credentials. Check email and password.' });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = {
  loginUser,
  getMe
};
