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

// Public route
router.get('/active', getActiveAnnouncement);

// Admin routes
router.get('/', protect, authorize('admin'), getAnnouncements);
router.post('/', protect, authorize('admin'), createAnnouncement);
router.put('/:id', protect, authorize('admin'), updateAnnouncement);
router.delete('/:id', protect, authorize('admin'), deleteAnnouncement);

module.exports = router;
