const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiter for registration attempts
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 registration attempts per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for verification code requests
const verificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 verification attempts per hour per IP
  message: {
    success: false,
    message: 'Too many verification attempts. Please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for resend code requests
const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 resend attempts per hour per IP
  message: {
    success: false,
    message: 'Too many resend requests. Please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});


// Rate limiter for password reset requests (requesting a reset link)
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for actual password reset submissions
const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 password reset attempts per hour per IP
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', registrationLimiter, authController.register);
router.post('/verify-email', authController.verifyEmail);
router.get('/verify-email', authController.verifyEmail);
router.post('/verify-code', verificationLimiter, authController.verifyEmailCode);
router.post('/resend-code', resendLimiter, authController.resendVerificationCode);
router.post('/set-password', authController.setPassword);
router.post('/login', authController.login);
router.post('/admin-login', authController.adminLogin);
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.post('/reset-password', resetPasswordLimiter, authController.resetPassword);

// Token validation endpoint for debugging
router.get('/validate-token', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: req.user,
  });
});

module.exports = router;
