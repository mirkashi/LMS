const express = require('express');
const router = express.Router();
const pageBackgroundController = require('../controllers/pageBackgroundController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');
const rateLimit = require('express-rate-limit');

const adminBackgroundLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 admin background requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Upload/update page background (admin only) - Must be before /:pageName
router.post(
  '/upload/:pageName',
  adminBackgroundLimiter,
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.single('image'),
  pageBackgroundController.uploadPageBackground
);
  adminBackgroundLimiter,

// Get all page backgrounds (admin only)
router.get(
  '/',
  authMiddleware,
  adminMiddleware,
  pageBackgroundController.getAllPageBackgrounds
);

// Get background image for a specific page (public route) - Must be last
router.get('/:pageName', pageBackgroundController.getPageBackground);
  adminBackgroundLimiter,

// Delete page background (admin only)
router.delete(
  '/:pageName',
  authMiddleware,
  adminMiddleware,
  pageBackgroundController.deletePageBackground
);

module.exports = router;
