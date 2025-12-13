const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('enrolledCourses');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
});

// Update user profile (name, email, phone, bio, avatar, password)
router.put('/profile', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    const { name, email, bio, phone, password, confirmPassword } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Email change (ensure uniqueness)
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing && existing._id.toString() !== userId) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use',
        });
      }
      user.email = email;
      user.isEmailVerified = false;
    }

    if (name) user.name = name;
    if (typeof bio !== 'undefined') user.bio = bio;
    if (typeof phone !== 'undefined') user.phone = phone;
    if (req.file) {
      const publicPath = `/uploads/${req.file.filename}`;
      user.avatar = publicPath;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters',
        });
      }
      if (confirmPassword && password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Passwords do not match',
        });
      }
      user.password = password;
    }

    await user.save();

    const { password: _, ...safeUser } = user.toObject();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
});

// Serve uploads path helper for absolute URLs
router.get('/profile/avatar/:file', (req, res) => {
  const filePath = path.join(__dirname, '..', 'uploads', req.params.file);
  res.sendFile(filePath);
});

module.exports = router;
