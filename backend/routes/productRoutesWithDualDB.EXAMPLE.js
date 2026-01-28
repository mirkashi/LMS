/**
 * Example: Dual Database Integration for Products
 * 
 * This shows how to integrate MongoDB (metadata) + PostgreSQL (images) 
 * in your product routes
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { authMiddleware } = require('../middleware/auth');
const postgresMediaUtils = require('../utils/postgresMediaUtils');
const rateLimit = require('express-rate-limit');

// Rate limiter for image deletion to mitigate DoS via repeated expensive operations
const deleteImageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 delete requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for fetching single products to protect MongoDB/PostgreSQL reads
const getProductLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // allow up to 300 product fetches per IP per window
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for image uploads to mitigate DoS via repeated database writes
const uploadImageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 upload requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// EXAMPLE: Create Product with Images
// ============================================
/**
 * POST /api/products
 * 
 * Request Body:
 * {
 *   "name": "Laptop",
 *   "description": "High-performance laptop",
 *   "price": 1200,
 *   "category": "Electronics",
 *   "images": ["image1.jpg", "image2.jpg", "image3.jpg"]  // URLs/paths
 * }
 * 
 * Flow:
 * 1. Save product metadata to MongoDB ✅ (name, description, price, category)
 * 2. Save image metadata to PostgreSQL (image URLs, file sizes, storage location)
 * 3. Return product with image references
 */
router.post('/', authMiddleware, uploadImageLimiter, async (req, res) => {
  try {
    const { name, description, price, category, images = [] } = req.body;

    // Normalize and bound images to prevent DoS via huge length values
    const MAX_IMAGES = 50;
    const productImages = Array.isArray(images) ? images.slice(0, MAX_IMAGES) : [];

    // Step 1: Save to MongoDB (metadata)
    const product = new Product({
      name,
      description,
      price,
      category,
      createdBy: req.user.userId,
      images: productImages, // Store image URLs temporarily
    });

    const savedProduct = await product.save();

    // Step 2: Save images to PostgreSQL (if any)
    const sequelize = req.app.get('sequelize');
    const imageRecords = [];

    if (sequelize && productImages.length > 0) {
      for (let i = 0; i < productImages.length; i++) {
        try {
          const imageRecord = await postgresMediaUtils.saveProductImage(
            sequelize,
            {
              mongoProductId: savedProduct._id.toString(),
              imageUrl: productImages[i],
              storageType: 'local', // or 'google-drive', 'cloud'
              isMainImage: i === 0, // First image is main
              uploadedBy: req.user.userId,
              // Additional optional fields:
              // fileSize: imageInfo.size,
              // mimeType: 'image/jpeg',
              // altText: `${name} image ${i + 1}`,
            }
          );
          imageRecords.push(imageRecord);
        } catch (err) {
          console.warn(`Failed to save image ${i} to PostgreSQL:`, err.message);
        }
      }
    }

    res.status(201).json({
      success: true,
      data: {
        product: savedProduct,
        imageRecords: imageRecords.length > 0 ? imageRecords : 'No PostgreSQL records',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
    });
  }
});

// ============================================
// EXAMPLE: Get Product with All Images
// ============================================
/**
 * GET /api/products/:id
 * 
 * Returns:
 * {
 *   "product": { // From MongoDB
 *     "_id": "...",
 *     "name": "Laptop",
 *     "price": 1200,
 *     ...
 *   },
 *   "images": [ // From PostgreSQL
 *     { "id": 1, "imageUrl": "...", "isMainImage": true },
 *     { "id": 2, "imageUrl": "...", "isMainImage": false }
 *   ]
 * }
 * }
 */
router.get('/:id', getProductLimiter, async (req, res) => {
  try {
    // Step 1: Get product from MongoDB

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Step 2: Get images from PostgreSQL
    const sequelize = req.app.get('sequelize');
    let images = [];

    if (sequelize) {
      try {
        images = await postgresMediaUtils.getProductImages(
          sequelize,
          req.params.id
        );
      } catch (err) {
        console.warn('Failed to fetch images from PostgreSQL:', err.message);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        product,
        images: images.length > 0 ? images : 'No images stored',
        totalImages: images.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
});

// ============================================
// EXAMPLE: Upload Additional Product Images
// ============================================
/**
 * POST /api/products/:id/images
 * 
 * Request Body:
 * {
 *   "imageUrl": "https://storage.example.com/image.jpg",
 *   "altText": "Product image"
 * }
 * 
 * Stores only to PostgreSQL - no MongoDB changes
 */
router.post('/:id/images', uploadImageLimiter, authMiddleware, async (req, res) => {
  try {
    const { imageUrl, altText } = req.body;
    const sequelize = req.app.get('sequelize');

    if (!sequelize) {
      return res.status(503).json({
        success: false,
        message: 'PostgreSQL not available',
      });
    }

    // Verify product exists in MongoDB
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Save image to PostgreSQL only
    const imageRecord = await postgresMediaUtils.saveProductImage(sequelize, {
      mongoProductId: req.params.id,
      imageUrl,
      altText,
      uploadedBy: req.user.userId,
      storageType: 'local',
    });

    res.status(201).json({
      success: true,
      data: imageRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message,
    });
  }
});

// ============================================
// EXAMPLE: Delete Product Image (PostgreSQL only)
// ============================================
/**
 * DELETE /api/products/:productId/images/:imageId
 * 
 * Only affects PostgreSQL, not MongoDB
 */
router.delete('/:productId/images/:imageId', deleteImageLimiter, authMiddleware, async (req, res) => {
  try {
    const sequelize = req.app.get('sequelize');

    if (!sequelize) {
      return res.status(503).json({
        success: false,
        message: 'PostgreSQL not available',
      });
    }

    const success = await postgresMediaUtils.deleteMedia(sequelize, req.params.imageId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message,
    });
  }
});

module.exports = router;

/**
 * ============================================
 * EXAMPLE: Dual Database Usage Patterns
 * ============================================
 * 
 * Pattern 1: Metadata + References
 * MongoDB: { name, price, description, images: ["url1", "url2"] }
 * PostgreSQL: { mongoProductId, imageUrl, fileSize, storage... }
 * 
 * Pattern 2: Heavy Content Offloaded
 * MongoDB: { title, duration, instructor }
 * PostgreSQL: { videoUrl, fileSize, resolution, processStatus }
 * 
 * Pattern 3: Access Tracking
 * MongoDB: { name, price }
 * PostgreSQL: { mediaUrl, fileSize, accessCount, lastAccessedAt }
 * 
 * ============================================
 * Benefits:
 * ✅ Fast queries on MongoDB metadata
 * ✅ Efficient storage of large files in PostgreSQL
 * ✅ PostgreSQL indexes for quick media lookups
 * ✅ Can backup/scale each DB independently
 * ✅ Easy to add analytics (access tracking)
 * 
 * ============================================
 */
