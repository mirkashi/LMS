const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const ProductReview = require('../models/ProductReview');
const { authMiddleware } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const reviewRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 review submissions per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

const productDetailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 product detail requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

const productListRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 product list requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Get all available products (public)
router.get('/', productListRateLimiter, async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
});

// Get product by ID (public)
router.get('/:id', productDetailRateLimiter, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
});

// Get reviews for a product (public)
router.get('/:id/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      ProductReview.find({ product: req.params.id, status: 'approved' })
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ProductReview.countDocuments({ product: req.params.id, status: 'approved' }),
    ]);

    res.status(200).json({
      success: true,
      count: total,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
});

// Create or update a review for a product
router.post('/:id/reviews', reviewRateLimiter, authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const sanitizedComment = (comment || '').toString().slice(0, 1000);

    // Upsert review per user/product
    await ProductReview.findOneAndUpdate(
      { product: req.params.id, user: req.user.id },
      {
        product: req.params.id,
        user: req.user.id,
        rating: Number(rating),
        comment: sanitizedComment,
        status: 'approved',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Recalculate aggregate rating
    const aggregates = await ProductReview.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(req.params.id), status: 'approved' } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, totalRatings: { $sum: 1 } } },
    ]);

    const agg = aggregates[0] || { avgRating: 0, totalRatings: 0 };
    await Product.findByIdAndUpdate(req.params.id, {
      rating: Number(agg.avgRating.toFixed(2)),
      totalRatings: agg.totalRatings,
    });

    const updatedReviews = await ProductReview.find({ product: req.params.id, status: 'approved' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(201).json({
      success: true,
      message: 'Review submitted',
      data: {
        rating: Number(agg.avgRating.toFixed(2)),
        totalRatings: agg.totalRatings,
        reviews: updatedReviews,
      },
    });
  } catch (error) {
    console.error('Review submit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message,
    });
  }
});

module.exports = router;
