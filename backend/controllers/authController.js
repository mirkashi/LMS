const crypto = require('crypto');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/mailer');

const findUserByVerificationToken = async (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });
};

// User Registration
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create new user
    const user = new User({ name, email, password });
    
    // Generate verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Registration failed: could not send verification email',
      });
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// Email Verification
exports.verifyEmail = async (req, res) => {
  try {
    const token = req.body.token || req.query.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }

    const user = await findUserByVerificationToken(token);

    if (!user) {
      if (req.query.redirect) {
        return res.redirect(`${req.query.redirect}?verified=0`);
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    if (req.query.redirect) {
      return res.redirect(`${req.query.redirect}?verified=1`);
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: error.message,
    });
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate password reset token
    const resetToken = user.generateEmailVerificationToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Password reset request failed',
      error: error.message,
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: error.message,
    });
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Admin login failed',
      error: error.message,
    });
  }
};

module.exports = exports;
