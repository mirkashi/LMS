const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  imageDriveFileId: {
    type: String,
    default: ''
  },
  imageStorageType: {
    type: String,
    enum: ['local', 'google-drive', ''],
    default: ''
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient ordering
teamMemberSchema.index({ order: 1 });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
