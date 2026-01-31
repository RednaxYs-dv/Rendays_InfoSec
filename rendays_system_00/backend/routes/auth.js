const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

// Helper function to generate a JWT (JSON Web Token)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// --- POST /api/auth/register ---
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  console.log('=== Registration Request ===');
  console.log('Username:', username);
  console.log('Email:', email);
  console.log('Password received:', password ? 'Yes' : 'No');

  try {
    // 1. Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide username, email, and password' 
      });
    }

    // 2. Check if user already exists
    console.log('Checking if user exists...');
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists');
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    // 3. Create new user
    console.log('Creating new user...');
    user = new User({ username, email, password });
    
    // 4. Save to DB (pre-save hook will hash password)
    console.log('Saving user to database...');
    await user.save(); 
    console.log('User saved successfully!');

    // 5. Respond with token
    res.status(201).json({
      success: true,
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error('=== Registration Error ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error); 

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username or Email already in use.' 
      });
    }
    
    // Generic server error
    res.status(500).json({ 
      success: false, 
      message: 'Server Error during registration',
      error: error.message 
    });
  }
});


// --- POST /api/auth/login ---
router.post('/login', async (req, res) => {
  const { username, email, password } = req.body;

  console.log('=== Login Request ===');
  console.log('Username:', username);
  console.log('Email:', email);

  try {
    // 1. Find user by email OR username
    const user = await User.findOne({ 
      $or: [{ email: email }, { username: username }] 
    });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid Credentials' 
      });
    }
    
    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid Credentials' 
      });
    }

    // 3. Respond with token and user info
    res.status(200).json({
      success: true,
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error during login' 
    });
  }
});


module.exports = router;