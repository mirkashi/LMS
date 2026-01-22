const express = require('express');
const router = express.Router();
const paymentTrackingController = require('../controllers/paymentTrackingController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const paymentTrackingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs for these routes
});

// User routes
router.get('/user/status', paymentTrackingLimiter, authMiddleware, paymentTrackingController.getUserPaymentStatus);
router.post('/:paymentId/retry', paymentTrackingLimiter, authMiddleware, paymentTrackingController.requestPaymentRetry);

// Admin routes
router.get('/admin/rejected', paymentTrackingLimiter, authMiddleware, adminOnly, paymentTrackingController.getRejectedPayments);
router.get('/admin/statistics', paymentTrackingLimiter, authMiddleware, adminOnly, paymentTrackingController.getPaymentStatistics);

module.exports = router;
