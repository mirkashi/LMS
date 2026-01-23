const express = require('express');
const router = express.Router();
const {
  getAllTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
} = require('../controllers/teamMemberController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');
const rateLimit = require('express-rate-limit');

const teamMemberAdminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs on admin team member routes
});

const teamMemberPublicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per windowMs on public team member routes
});

// Public routes
router.get('/', teamMemberPublicLimiter, getAllTeamMembers);
router.get('/:id', teamMemberPublicLimiter, getTeamMemberById);

// Admin routes
router.post('/', teamMemberAdminLimiter, authMiddleware, adminMiddleware, uploadMiddleware.single('image'), createTeamMember);
router.put('/:id', teamMemberAdminLimiter, authMiddleware, adminMiddleware, uploadMiddleware.single('image'), updateTeamMember);
router.delete('/:id', teamMemberAdminLimiter, authMiddleware, adminMiddleware, deleteTeamMember);

module.exports = router;
