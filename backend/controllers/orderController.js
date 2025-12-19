const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const crypto = require('crypto');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount, customerName, customerEmail, customerPhone, shippingMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    // Verify items and prices (optional but recommended)
    // For now, we trust the frontend but in production you should recalculate prices
    
    const orderId = 'ORD-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const order = await Order.create({
      orderId,
      user: req.user.id,
      items: items.map(item => ({
        product: item.product, // Assuming item has product ID
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentMethodLabel: paymentMethod,
      shippingMethod,
      customerName,
      customerEmail,
      customerPhone,
      paymentStatus: 'pending' // In a real app, you'd handle payment gateway here
    });

    // Clear user's cart
    await User.findByIdAndUpdate(req.user.id, { cart: [] });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
