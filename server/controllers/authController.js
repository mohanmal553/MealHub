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

  try {
    const user = await User.findOne({ email: cleanEmail });
    if (user) {
      const isMatch = await user.comparePassword(cleanPassword);
      if (isMatch) {
        console.log(`✅ Login Grant Success: ${cleanEmail} (${user.role})`);
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'student',
          roomNumber: user.roomNumber || '',
          token: generateToken(user._id)
        });
      }
    }
  } catch (err) {
    console.error('Error during database login check:', err);
    return res.status(500).json({ message: 'Database connection error during authentication' });
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
