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

// Public route
router.get('/active', getActiveAnnouncement);

// Admin routes
router.get('/', adminAnnouncementLimiter, protect, authorize('admin'), getAnnouncements);
router.post('/', adminAnnouncementLimiter, protect, authorize('admin'), createAnnouncement);
router.put('/:id', adminAnnouncementLimiter, protect, authorize('admin'), updateAnnouncement);
router.delete('/:id', adminAnnouncementLimiter, protect, authorize('admin'), deleteAnnouncement);

module.exports = router;
