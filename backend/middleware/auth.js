const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    // Verify token (throws if expired or invalid)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // SECURITY: Re-fetch user from DB on every request to ensure they still exist
    // and haven't been disabled – don't trust the token payload alone
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or account disabled' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired, please log in again' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    console.error('Auth middleware error:', error.name);
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

module.exports = auth;
