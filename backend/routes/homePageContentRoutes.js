const express = require('express');
const router = express.Router();

const homePageContentController = require('../controllers/homePageContentController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

// Public read
router.get('/', homePageContentController.getHomePageContent);

// Admin upsert (optional image upload)
router.put(
  '/',
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.single('heroImage'),
  homePageContentController.upsertHomePageContent
);

module.exports = router;
