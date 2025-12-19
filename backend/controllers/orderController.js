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

// @desc    Bulk update order status
// @route   POST /api/admin/orders/bulk-update
// @access  Private/Admin
exports.bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { orderIds, status } = req.body;

    // Validate required fields
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order IDs array is required and must not be empty'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Validate status enum
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Find orders that exist
    const existingOrders = await Order.find({ _id: { $in: orderIds } });
    const existingOrderIds = existingOrders.map(order => order._id.toString());

    // Identify invalid order IDs
    const invalidOrderIds = orderIds.filter(id => !existingOrderIds.includes(id));

    if (invalidOrderIds.length > 0) {
      return res.status(404).json({
        success: false,
        message: `Some orders not found: ${invalidOrderIds.join(', ')}`
      });
    }

    // Bulk update orders
    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { status: status } }
    );

    // Emit order update events for each updated order
    const io = req.app.get('io');
    orderIds.forEach(orderId => {
      io.emit('order-update', {
        orderId: orderId,
        status: status
      });
    });

    res.status(200).json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} orders`,
      data: {
        updatedCount: result.modifiedCount,
        failedCount: orderIds.length - result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Bulk update error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error during bulk update',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
