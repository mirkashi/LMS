const crypto = require('crypto');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { 
  sendVerificationEmail, 
  sendVerificationCodeEmail, 
  sendPasswordResetEmail 
} = require('../utils/mailer');

const findUserByVerificationToken = async (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });
};

// User Registration (Step 1: Name, Email, Phone only - Password set later)
exports.register = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Validation - name, email, phone only (no password at this stage)
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and phone',
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: { $eq: email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create new user WITHOUT password (will be set later)
    const user = new User({ name, email, phone });
    
    // Generate 6-digit verification code
    const verificationCode = user.generateVerificationCode();
    user.lastEmailVerificationSentAt = Date.now();
    
    await user.save();

    // Send verification code email
    try {
      await sendVerificationCodeEmail(email, verificationCode, name);
      
      res.status(201).json({
        success: true,
        message: 'Registration successful! A 6-digit verification code has been sent to your email.',
        userId: user._id,
        email: user.email,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      
      // Delete the user if email fails
      await User.findByIdAndDelete(user._id);
      
      return res.status(500).json({
        success: false,
        message: 'Registration failed: could not send verification email. Please try again.',
      });
    }
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

// Verify Email with 6-digit Code
exports.verifyEmailCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required',
      });
    }

    // Validate email format and type to prevent NoSQL injection
    if (typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email.',
      });
    }
    const safeEmail = email.trim().toLowerCase();

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid code format. Code must be 6 digits.',
      });
    }

    const user = await User.findOne({ email: { $eq: safeEmail } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Check if code has expired
    if (!user.emailVerificationCodeExpires || user.emailVerificationCodeExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    // Check max attempts (3 attempts)
    if (user.emailVerificationAttempts >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please request a new verification code.',
      });
    }

    // Verify the code
    const isValidCode = user.verifyCode(code);

    if (!isValidCode) {
      user.emailVerificationAttempts += 1;
      await user.save();

      const attemptsLeft = 3 - user.emailVerificationAttempts;
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`,
      });
    }

    // Successfully verified
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpires = undefined;
    user.emailVerificationAttempts = 0;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      redirectTo: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/dashboard` : '/'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: error.message,
    });
  }
};

// Resend Verification Code
exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    if (typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    const user = await User.findOne({ email: { $eq: email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Rate limiting: Check if last email was sent less than 1 minute ago
    if (user.lastEmailVerificationSentAt) {
      const timeSinceLastSend = Date.now() - user.lastEmailVerificationSentAt.getTime();
      const oneMinute = 60 * 1000;

      if (timeSinceLastSend < oneMinute) {
        const secondsLeft = Math.ceil((oneMinute - timeSinceLastSend) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${secondsLeft} seconds before requesting a new code`,
        });
      }
    }

    // Generate new verification code
    const verificationCode = user.generateVerificationCode();
    user.lastEmailVerificationSentAt = Date.now();
    await user.save();

    // Send verification code email
    try {
      await sendVerificationCodeEmail(email, verificationCode, user.name);

      res.status(200).json({
        success: true,
        message: 'A new verification code has been sent to your email',
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification code',
      error: error.message,
    });
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    const { email, password, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Ensure email and password are strings to prevent injection via objects
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password format',
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a phone number',
      });
    }

    // Optionally ensure phone is also a string
    if (typeof phone !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format',
      });
    }

    const user = await User.findOne({ email: { $eq: email } }).select('+password');

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

    // Update phone number if provided
    if (phone && user.phone !== phone) {
      user.phone = phone;
      await user.save();
    }

    const token = generateToken(user._id, user.role);

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
        phone: user.phone,
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

    // Ensure email is a string to prevent NoSQL injection via query operators
    if (typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    const user = await User.findOne({ email: { $eq: trimmedEmail } });

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
      await sendPasswordResetEmail(trimmedEmail, resetToken);
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

    // Ensure token is a string to prevent NoSQL injection via query operators
    if (typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token format',
      });
    }

    const trimmedToken = token.trim();
    if (!trimmedToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token format',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Password validation: only enforce length between 8 and 12 characters
    if (password.length < 8 || password.length > 12) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 8 and 12 characters long',
      });
    }

    const user = await User.findOne({
      passwordResetToken: { $eq: trimmedToken },
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

// Set Password After Email Verification
exports.setPassword = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    if (typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    email = email.trim().toLowerCase();

    // Password validation: only enforce length between 8 and 12 characters
    if (password.length < 8 || password.length > 12) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 8 and 12 characters long',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email must be verified first',
      });
    }

    // Set the password
    user.password = password;
    await user.save();

    // Generate token for auto-login
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Password set successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      redirectTo: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/dashboard` : '/dashboard'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to set password',
      error: error.message,
    });
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const normalizedEmail = email.trim();

    const user = await User.findOne({ email: { $eq: normalizedEmail } }).select('+password');

    if (!user || user.role !== 'admin') {
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

    const token = generateToken(user._id, user.role);

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
