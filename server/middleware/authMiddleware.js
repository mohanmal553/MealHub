const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getInMemUserById } = require('../utils/inMemoryStore');

const JWT_SECRET = process.env.JWT_SECRET || 'mealhub_jwt_secret_key_2026';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      // Check Mongoose DB first
      try {
        req.user = await User.findById(decoded.id).select('-password');
      } catch (dbErr) {
        req.user = null;
      }

      // If DB user not found, check in-memory fallback store
      if (!req.user && typeof getInMemUserById === 'function') {
        req.user = getInMemUserById(decoded.id);
      }

      if (!req.user) {
        // Fallback for admin_1 synthetic ID
        if (decoded.id === 'admin_1' || decoded.id?.toString() === 'admin_1') {
          req.user = {
            _id: 'admin_1',
            name: 'MealHub Admin',
            email: 'mealhub.mohan@gmail.com',
            role: 'admin',
            roomNumber: 'A-101'
          };
        } else {
          return res.status(401).json({ message: 'User account not found' });
        }
      }

      next();
    } catch (error) {
      console.error('JWT Auth Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
};

module.exports = { protect, adminOnly, JWT_SECRET };
