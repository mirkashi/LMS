const mongoose = require('mongoose');

const courseAuditLogSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: ['created', 'updated', 'deleted', 'published', 'unpublished', 'video_added', 'video_updated', 'video_removed'],
      required: true,
    },
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed,
    },
    changedFields: [String],
    reason: String,
    ipAddress: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookups
courseAuditLogSchema.index({ course: 1, timestamp: -1 });
courseAuditLogSchema.index({ admin: 1, timestamp: -1 });

module.exports = mongoose.model('CourseAuditLog', courseAuditLogSchema);
