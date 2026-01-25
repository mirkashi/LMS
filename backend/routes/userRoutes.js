const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Rate limiter for wishlist operations to prevent abuse
const wishlistLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 wishlist requests per window
});

// Rate limiter for cart operations to prevent abuse
const cartLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 cart requests per window
});

// Rate limiter for serving avatar files to prevent abuse of filesystem access
const avatarLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 avatar requests per window
});

// Rate limiter for profile operations to prevent abuse
const profileLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 profile requests per window
});

// Get user profile
router.get('/profile', profileLimiter, authMiddleware, async (req, res) => {
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
router.put('/profile', authMiddleware, profileLimiter, upload.single('avatar'), async (req, res) => {
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
    if (typeof email !== 'undefined' && email !== user.email) {
      if (typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format',
        });
      }
      const normalizedEmail = email.trim();
      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email cannot be empty',
        });
      }
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing && existing._id.toString() !== userId) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use',
        });
      }
      user.email = normalizedEmail;
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
router.get('/profile/avatar/:file', avatarLimiter, (req, res) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const requestedPath = path.resolve(uploadsDir, req.params.file);

  // Ensure the resolved path is within the uploads directory to prevent path traversal
  if (!requestedPath.startsWith(uploadsDir + path.sep)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file path',
    });
  }

  res.sendFile(requestedPath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to serve file',
      });
    }
  });
});

// --- Wishlist Routes ---

// Optional auth middleware (allows both authenticated and guest users)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1];
        const { verifyToken } = require('../utils/jwt');
        const decoded = verifyToken(token);
        if (decoded) {
          req.user = {
            id: decoded.id || decoded.userId,
            userId: decoded.userId || decoded.id,
            role: decoded.role
          };
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
};

// Get Wishlist
router.get('/wishlist', wishlistLimiter, optionalAuth, async (req, res) => {
  try {
    // If user is not authenticated, return empty wishlist
    if (!req.user) {
      return res.json({ success: true, data: [] });
    }
    const user = await User.findById(req.user.userId).populate('wishlist');
    res.json({ success: true, data: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add to Wishlist
router.post('/wishlist/:productId', authMiddleware, wishlistLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user.wishlist.includes(req.params.productId)) {
      user.wishlist.push(req.params.productId);
      await user.save();
    }
    res.json({ success: true, data: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove from Wishlist
router.delete('/wishlist/:productId', authMiddleware, wishlistLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
    await user.save();
    res.json({ success: true, data: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- Cart Routes ---

// Get Cart
router.get('/cart', authMiddleware, cartLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('cart.product');
    res.json({ success: true, data: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add to Cart
router.post('/cart', authMiddleware, cartLimiter, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const user = await User.findById(req.user.userId);
    
    const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);
    
    if (cartItemIndex > -1) {
      user.cart[cartItemIndex].quantity += quantity || 1;
    } else {
      user.cart.push({ product: productId, quantity: quantity || 1 });
    }
    
    await user.save();
    // Populate for return
    await user.populate('cart.product');
    res.json({ success: true, data: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update Cart Item Quantity
router.put('/cart/:productId', authMiddleware, cartLimiter, async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user.userId);
    
    const cartItem = user.cart.find(item => item.product.toString() === req.params.productId);
    if (cartItem) {
      cartItem.quantity = quantity;
      await user.save();
    }
    
    await user.populate('cart.product');
    res.json({ success: true, data: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove from Cart
router.delete('/cart/:productId', authMiddleware, cartLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.cart = user.cart.filter(item => item.product.toString() !== req.params.productId);
    await user.save();
    await user.populate('cart.product');
    res.json({ success: true, data: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
