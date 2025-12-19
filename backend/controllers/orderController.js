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

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'Invalid shipping address' });
    }

    if (!customerEmail || !customerName) {
      return res.status(400).json({ success: false, message: 'Customer information required' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'User authentication failed' });
    }

    // Verify user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify products exist
    const productIds = items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    
    if (products.length !== productIds.length) {
      return res.status(400).json({ success: false, message: 'One or more products not found' });
    }

    // Create order with validated data
    const orderId = 'ORD-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const orderData = {
      orderId,
      user: req.user.id,
      items: items.map(item => ({
        product: item.product,
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || 0
      })),
      totalAmount: parseFloat(totalAmount) || 0,
      shippingAddress: {
        street: shippingAddress.street || '',
        street2: shippingAddress.street2 || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        zip: shippingAddress.zip || '',
        country: shippingAddress.country || 'PK'
      },
      paymentMethod: paymentMethod || 'stripe',
      paymentMethodLabel: paymentMethod || 'stripe',
      shippingMethod: shippingMethod || 'standard',
      customerName: customerName.trim(),
      customerEmail: customerEmail.toLowerCase(),
      customerPhone: customerPhone || '',
      paymentStatus: 'pending'
    };

    const order = await Order.create(orderData);

    // Clear user's cart
    await User.findByIdAndUpdate(req.user.id, { $set: { cart: [] } });

    res.status(201).json({
      success: true,
      data: {
        orderId: order.orderId,
        _id: order._id,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus
      }
    });
  } catch (error) {
    console.error('Order creation error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server Error creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
