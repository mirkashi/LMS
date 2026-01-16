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

// Public routes
router.get('/', getAllTeamMembers);
router.get('/:id', getTeamMemberById);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, uploadMiddleware.single('image'), createTeamMember);
router.put('/:id', authMiddleware, adminMiddleware, uploadMiddleware.single('image'), updateTeamMember);
router.delete('/:id', authMiddleware, adminMiddleware, deleteTeamMember);

module.exports = router;
