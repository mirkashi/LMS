const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders } = require('../controllers/orderController');
const { authMiddleware: protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const myOrdersLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP/user to 100 requests per windowMs for /myorders
});

const createOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP/user to 100 requests per windowMs for create order
});

router.route('/').post(protect, createOrderLimiter, createOrder);
router.route('/myorders').get(protect, myOrdersLimiter, getMyOrders);

module.exports = router;
