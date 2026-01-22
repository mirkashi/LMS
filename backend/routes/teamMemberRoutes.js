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

// Public routes
router.get('/', getAllTeamMembers);
router.get('/:id', getTeamMemberById);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, teamMemberAdminLimiter, uploadMiddleware.single('image'), createTeamMember);
router.put('/:id', authMiddleware, adminMiddleware, teamMemberAdminLimiter, uploadMiddleware.single('image'), updateTeamMember);
router.delete('/:id', authMiddleware, adminMiddleware, teamMemberAdminLimiter, deleteTeamMember);

module.exports = router;
