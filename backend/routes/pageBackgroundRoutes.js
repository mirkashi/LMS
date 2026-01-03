const express = require('express');
const router = express.Router();
const pageBackgroundController = require('../controllers/pageBackgroundController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

// Upload/update page background (admin only) - Must be before /:pageName
router.post(
  '/upload/:pageName',
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.single('image'),
  pageBackgroundController.uploadPageBackground
);

// Get all page backgrounds (admin only)
router.get(
  '/',
  authMiddleware,
  adminMiddleware,
  pageBackgroundController.getAllPageBackgrounds
);

// Get background image for a specific page (public route) - Must be last
router.get('/:pageName', pageBackgroundController.getPageBackground);

// Delete page background (admin only)
router.delete(
  '/:pageName',
  authMiddleware,
  adminMiddleware,
  pageBackgroundController.deletePageBackground
);

module.exports = router;
