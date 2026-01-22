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
router.get('/', protect, authorize('admin'), adminAnnouncementLimiter, getAnnouncements);
router.post('/', protect, authorize('admin'), adminAnnouncementLimiter, createAnnouncement);
router.put('/:id', protect, authorize('admin'), adminAnnouncementLimiter, updateAnnouncement);
router.delete('/:id', protect, authorize('admin'), adminAnnouncementLimiter, deleteAnnouncement);

module.exports = router;
