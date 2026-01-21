/**
 * SEO Routes
 * API endpoints for SEO-related data and sitemap generation
 */

const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Product = require('../models/Product');

/**
 * @route   GET /api/seo/sitemap-data
 * @desc    Get all data needed for sitemap generation
 * @access  Public
 */
router.get('/sitemap-data', async (req, res) => {
  try {
    // Fetch courses with minimal fields
    const courses = await Course.find({ isPublished: { $ne: false } })
      .select('_id title updatedAt createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch products with minimal fields
    const products = await Product.find({ isAvailable: true })
      .select('_id name updatedAt createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Static pages configuration
    const staticPages = [
      { path: '/', priority: 1.0, changefreq: 'daily' },
      { path: '/courses', priority: 0.9, changefreq: 'daily' },
      { path: '/shop', priority: 0.9, changefreq: 'daily' },
      { path: '/about', priority: 0.7, changefreq: 'monthly' },
      { path: '/contact', priority: 0.7, changefreq: 'monthly' },
      { path: '/faq', priority: 0.6, changefreq: 'monthly' },
      { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
      { path: '/terms', priority: 0.3, changefreq: 'yearly' },
    ];

    res.status(200).json({
      success: true,
      data: {
        courses: courses.map(course => ({
          id: course._id,
          lastModified: course.updatedAt || course.createdAt,
        })),
        products: products.map(product => ({
          id: product._id,
          lastModified: product.updatedAt || product.createdAt,
        })),
        staticPages,
      },
    });
  } catch (error) {
    console.error('Error fetching sitemap data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sitemap data',
    });
  }
});

/**
 * @route   GET /api/seo/meta/:pageType/:id?
 * @desc    Get SEO metadata for a specific page
 * @access  Public
 */
router.get('/meta/:pageType/:id?', async (req, res) => {
  try {
    const { pageType, id } = req.params;
    let metadata = {};

    switch (pageType) {
      case 'course':
        if (id) {
          const course = await Course.findById(id)
            .select('title description thumbnail category level rating totalRatings price createdAt updatedAt')
            .populate('instructor', 'name email')
            .lean();

          if (!course) {
            return res.status(404).json({
              success: false,
              message: 'Course not found',
            });
          }

          metadata = {
            title: course.title,
            description: course.description?.substring(0, 160),
            keywords: `${course.title}, ${course.category}, ${course.level} course, eBay course, online learning`,
            image: course.thumbnail,
            type: 'article',
            publishedTime: course.createdAt,
            modifiedTime: course.updatedAt,
            author: course.instructor?.name,
          };
        }
        break;

      case 'product':
        if (id) {
          const product = await Product.findById(id)
            .select('name description images image category price rating totalRatings stock isAvailable createdAt updatedAt')
            .lean();

          if (!product) {
            return res.status(404).json({
              success: false,
              message: 'Product not found',
            });
          }

          metadata = {
            title: product.name,
            description: product.description?.substring(0, 160),
            keywords: `${product.name}, ${product.category}, eBay tools, eBay resources`,
            image: product.images?.[0] || product.image,
            type: 'product',
            availability: product.isAvailable && product.stock > 0 ? 'in_stock' : 'out_of_stock',
            price: product.price,
            publishedTime: product.createdAt,
            modifiedTime: product.updatedAt,
          };
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid page type',
        });
    }

    res.status(200).json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch metadata',
    });
  }
});

/**
 * @route   GET /api/seo/stats
 * @desc    Get SEO statistics (total courses, products, etc.)
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    const [totalCourses, totalProducts, totalCategories] = await Promise.all([
      Course.countDocuments({ isPublished: { $ne: false } }),
      Product.countDocuments({ isAvailable: true }),
      Course.distinct('category'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCourses,
        totalProducts,
        totalCategories: totalCategories.length,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    console.error('Error fetching SEO stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SEO stats',
    });
  }
});

module.exports = router;
