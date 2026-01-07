const express = require('express');
const router = express.Router();
const paymentTrackingController = require('../controllers/paymentTrackingController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// User routes
router.get('/user/status', authMiddleware, paymentTrackingController.getUserPaymentStatus);
router.post('/:paymentId/retry', authMiddleware, paymentTrackingController.requestPaymentRetry);

// Admin routes
router.get('/admin/rejected', authMiddleware, adminOnly, paymentTrackingController.getRejectedPayments);
router.get('/admin/statistics', authMiddleware, adminOnly, paymentTrackingController.getPaymentStatistics);

module.exports = router;
