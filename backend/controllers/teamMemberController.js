const TeamMember = require('../models/TeamMember');
const { uploadBufferToDrive } = require('../utils/googleDrive');

// Get all team members (public)
exports.getAllTeamMembers = async (req, res) => {
  try {
    const teamMembers = await TeamMember.find().sort({ order: 1 });
    
    res.json({
      success: true,
      data: teamMembers
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team members'
    });
  }
};

// Get single team member by ID (public)
exports.getTeamMemberById = async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }
    
    res.json({
      success: true,
      data: teamMember
    });
  } catch (error) {
    console.error('Get team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team member'
    });
  }
};

// Create team member (admin only)
exports.createTeamMember = async (req, res) => {
  try {
    const { name, role, bio, order } = req.body;
    
    if (!name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name and role are required'
      });
    }
    
    const teamMemberData = {
      name,
      role,
      bio: bio || '',
      order: order || 0
    };
    
    // Handle image upload if provided
    if (req.file) {
      const uploadResult = await uploadBufferToDrive(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        'team-members'
      );
      
      teamMemberData.imageUrl = uploadResult.url;
      teamMemberData.imageDriveFileId = uploadResult.driveFileId || '';
      teamMemberData.imageStorageType = uploadResult.storageType;
    }
    
    const teamMember = new TeamMember(teamMemberData);
    await teamMember.save();
    
    res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      data: teamMember
    });
  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create team member'
    });
  }
};

// Update team member (admin only)
exports.updateTeamMember = async (req, res) => {
  try {
    const { name, role, bio, order } = req.body;
    const teamMember = await TeamMember.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }
    
    // Update basic fields
    if (name) teamMember.name = name;
    if (role) teamMember.role = role;
    if (bio !== undefined) teamMember.bio = bio;
    if (order !== undefined) teamMember.order = order;
    
    // Handle image upload if provided
    if (req.file) {
      const uploadResult = await uploadBufferToDrive(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        'team-members'
      );
      
      teamMember.imageUrl = uploadResult.url;
      teamMember.imageDriveFileId = uploadResult.driveFileId || '';
      teamMember.imageStorageType = uploadResult.storageType;
    }
    
    await teamMember.save();
    
    res.json({
      success: true,
      message: 'Team member updated successfully',
      data: teamMember
    });
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update team member'
    });
  }
};

// Delete team member (admin only)
exports.deleteTeamMember = async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }
    
    await teamMember.deleteOne();
    
    res.json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete team member'
    });
  }
};
