const Course = require('../models/Course');
const CourseAuditLog = require('../models/CourseAuditLog');
const User = require('../models/User');

/**
 * Log course changes for audit trail
 */
exports.logCourseChange = async (courseId, adminId, action, changes, reason, req) => {
  try {
    const auditLog = new CourseAuditLog({
      course: courseId,
      admin: adminId,
      action,
      changes: changes || {},
      changedFields: changes?.after ? Object.keys(changes.after) : [],
      reason,
      ipAddress: req?.ip || req?.connection?.remoteAddress || 'unknown',
      userAgent: req?.get?.('user-agent') || 'unknown',
    });

    await auditLog.save();
    console.log(`✅ Audit log created for course ${courseId}: ${action}`);
    return auditLog;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging shouldn't break the main operation
    return null;
  }
};

/**
 * Get audit trail for a course
 */
exports.getCourseAuditLog = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const auditLogs = await CourseAuditLog.find({ course: courseId })
      .populate('admin', 'name email')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await CourseAuditLog.countDocuments({ course: courseId });

    res.status(200).json({
      success: true,
      data: auditLogs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message,
    });
  }
};

/**
 * Validate video URL format
 */
exports.validateVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;

  // Allowed video sources
  const patterns = [
    /^https:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]{11}/, // YouTube
    /^https:\/\/youtu\.be\/[\w-]{11}/, // YouTube short
    /^https:\/\/(www\.)?vimeo\.com\/\d+/, // Vimeo
    /^https:\/\/.*\.(mp4|webm|ogg|mov|avi)$/i, // Direct video files
    /^https:\/\/(www\.)?dailymotion\.com/, // DailyMotion
    /^https:\/\/(www\.)?twitch\.tv/, // Twitch
    /^https:\/\/.*\/video/ // Generic video path
  ];

  return patterns.some(pattern => pattern.test(url));
};

/**
 * Check for duplicate video links in a course
 */
exports.checkDuplicateVideoLinks = (modules, videoUrl) => {
  if (!modules || !Array.isArray(modules)) return false;

  for (const module of modules) {
    if (module.lessons && Array.isArray(module.lessons)) {
      for (const lesson of module.lessons) {
        if (lesson.videoLink === videoUrl || lesson.videoUrl === videoUrl) {
          return true;
        }
      }
    }
  }

  return false;
};

/**
 * Enhanced update course with video link validation and audit logging
 */
exports.updateCourseWithValidation = async (courseId, updateData, adminId, req) => {
  try {
    const course = await Course.findById(courseId);

    if (!course) {
      throw new Error('Course not found');
    }

    const changes = {
      before: {},
      after: {},
    };

    // Track changes for audit log
    if (updateData.introVideoLink && updateData.introVideoLink !== course.introVideoLink) {
      // Validate video URL
      if (!exports.validateVideoUrl(updateData.introVideoLink)) {
        throw new Error('Invalid video URL format. Supported: YouTube, Vimeo, or direct MP4/WebM/OGG links');
      }

      // Check for duplicates in course modules
      if (exports.checkDuplicateVideoLinks(course.modules, updateData.introVideoLink)) {
        console.warn('⚠️ Warning: This video link already exists in course modules');
      }

      changes.before.introVideoLink = course.introVideoLink;
      changes.after.introVideoLink = updateData.introVideoLink;
      course.introVideoLink = updateData.introVideoLink;
    }

    if (updateData.title && updateData.title !== course.title) {
      changes.before.title = course.title;
      changes.after.title = updateData.title;
      course.title = updateData.title;
    }

    if (updateData.description && updateData.description !== course.description) {
      changes.before.description = course.description;
      changes.after.description = updateData.description;
      course.description = updateData.description;
    }

    if (updateData.duration !== undefined && updateData.duration !== course.duration) {
      changes.before.duration = course.duration;
      changes.after.duration = updateData.duration;
      course.duration = updateData.duration;
    }

    if (updateData.price !== undefined && updateData.price !== course.price) {
      changes.before.price = course.price;
      changes.after.price = updateData.price;
      course.price = updateData.price;
    }

    await course.save();

    // Log the changes
    if (Object.keys(changes.after).length > 0) {
      await exports.logCourseChange(courseId, adminId, 'updated', changes, 'Course details updated', req);
    }

    return course;
  } catch (error) {
    throw error;
  }
};

/**
 * Get video validation status
 */
exports.getVideoValidationStatus = (videoUrl) => {
  if (!videoUrl) {
    return { valid: false, reason: 'No video URL provided' };
  }

  if (!exports.validateVideoUrl(videoUrl)) {
    return {
      valid: false,
      reason: 'Invalid video URL format',
      supportedFormats: ['YouTube', 'Vimeo', 'Direct MP4/WebM/OGG links'],
    };
  }

  return { valid: true, reason: 'Video URL is valid' };
};
