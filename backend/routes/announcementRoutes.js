const express = require('express');
const router = express.Router();
const {
  getActiveAnnouncement,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { authMiddleware: protect, authorize } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiter for admin announcement routes
const adminAnnouncementLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 admin announcement requests per windowMs
});

// Rate limiter for public active announcement route
const publicAnnouncementLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 60, // limit each IP to 60 requests per windowMs on the public endpoint
});

// Public route
router.get('/active', publicAnnouncementLimiter, getActiveAnnouncement);

// Admin routes
router.get('/', adminAnnouncementLimiter, protect, authorize('admin'), getAnnouncements);
router.post('/', adminAnnouncementLimiter, protect, authorize('admin'), createAnnouncement);
router.put('/:id', adminAnnouncementLimiter, protect, authorize('admin'), updateAnnouncement);
router.delete('/:id', adminAnnouncementLimiter, protect, authorize('admin'), deleteAnnouncement);

module.exports = router;
