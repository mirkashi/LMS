/**
 * Example: Dual Database Integration for Courses
 * 
 * This shows how to integrate MongoDB (metadata) + PostgreSQL (videos/resources) 
 * in your course routes
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const { authMiddleware } = require('../middleware/auth');
const postgresMediaUtils = require('../utils/postgresMediaUtils');
const rateLimit = require('express-rate-limit');

const videoAccessLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 30, // limit each IP to 30 access-tracking requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Separate limiter for video upload endpoints (intro/lesson videos)
const videoUploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // limit each IP to 10 upload requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for fetching full course data (MongoDB + PostgreSQL)
const courseFullLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 60, // limit each IP to 60 full-course requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// ============================================
// EXAMPLE: Create Course (Metadata in MongoDB)
// ============================================
/**
 * POST /api/courses
 * 
 * Request Body:
 * {
 *   "title": "Advanced JavaScript",
 *   "description": "Learn advanced JavaScript concepts",
 *   "price": 99.99,
 *   "category": "Programming",
 *   "level": "advanced",
 *   "duration": 40
 * }
 * 
 * Flow:
 * 1. Save course metadata to MongoDB
 * 2. Ready to add videos/resources to PostgreSQL later
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, price, category, level, duration } = req.body;

    const course = new Course({
      title,
      description,
      price,
      category,
      level,
      duration,
      instructor: req.user.userId,
    });

    const savedCourse = await course.save();

    res.status(201).json({
      success: true,
      data: savedCourse,
      message: 'Course created. You can now add videos and resources.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message,
    });
  }
});

// ============================================
// EXAMPLE: Upload Course Intro Video
// ============================================
/**
 * POST /api/courses/:courseId/intro-video
 * 
 * Request Body:
 * {
 *   "videoUrl": "s3://bucket/intro-video.mp4",
 *   "storageType": "cloud",
 *   "duration": 180 (seconds)
 * }
 * 
 * Stores video reference in PostgreSQL only
 */
router.post('/:courseId/intro-video', authMiddleware, videoUploadLimiter, async (req, res) => {
  try {
    const { videoUrl, storageType = 'local', duration } = req.body;
    const sequelize = req.app.get('sequelize');

    if (!sequelize) {
      return res.status(503).json({
        success: false,
        message: 'PostgreSQL not available',
      });
    }

    // Verify course exists
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Save intro video to PostgreSQL
    const videoRecord = await postgresMediaUtils.saveCourseVideo(sequelize, {
      mongoCourseId: req.params.courseId,
      videoType: 'intro',
      videoUrl,
      storageType,
      duration,
      uploadedBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      data: videoRecord,
      message: 'Intro video uploaded successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload intro video',
      error: error.message,
    });
  }
});

// ============================================
// EXAMPLE: Upload Lesson Video
// ============================================
/**
 * POST /api/courses/:courseId/lessons/:lessonId/video
 * 
 * Request Body:
 * {
 *   "videoUrl": "s3://bucket/lesson1-video.mp4",
 *   "storageType": "cloud",
 *   "duration": 1200,
 *   "thumbnail": "s3://bucket/lesson1-thumb.jpg"
 * }
 * 
 * Stores lesson video in PostgreSQL with lesson reference
 */
router.post('/:courseId/lessons/:lessonId/video', authMiddleware, videoUploadLimiter, async (req, res) => {
  try {
    const { videoUrl, storageType = 'local', duration, thumbnail } = req.body;
    const { courseId, lessonId } = req.params;
    const sequelize = req.app.get('sequelize');

    if (!sequelize) {
      return res.status(503).json({
        success: false,
        message: 'PostgreSQL not available',
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Save lesson video to PostgreSQL
    const videoRecord = await postgresMediaUtils.saveCourseVideo(sequelize, {
      mongoCourseId: courseId,
      videoType: 'lesson',
      mongoLessonId: lessonId,
      videoUrl,
      storageType,
      duration,
      thumbnail,
      uploadedBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      data: videoRecord,
      message: 'Lesson video uploaded successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload lesson video',
      error: error.message,
    });
  }
});

// ============================================
// EXAMPLE: Get All Course Videos
// ============================================
/**
 * GET /api/courses/:courseId/videos
 * 
 * Returns all videos (intro, lessons) for a course from PostgreSQL
 */
router.get('/:courseId/videos', videoAccessLimiter, async (req, res) => {
  try {
    const sequelize = req.app.get('sequelize');

    if (!sequelize) {
      return res.status(503).json({
        success: false,
        message: 'PostgreSQL not available',
      });
    }

    const videos = await postgresMediaUtils.getCourseVideos(sequelize, req.params.courseId);

    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos',
      error: error.message,
    });
  }
});

// ============================================
// EXAMPLE: Upload Course Resource (PDF, Document)
// ============================================
/**
 * POST /api/courses/:courseId/lessons/:lessonId/resources
 * 
 * Request Body:
 * {
 *   "resourceName": "Course Notes",
 *   "resourceUrl": "s3://bucket/notes.pdf",
 *   "resourceType": "pdf",
 *   "storageType": "cloud"
 * }
 * 
 * Stores resource metadata in PostgreSQL
 */
router.post('/:courseId/lessons/:lessonId/resources', authMiddleware, videoAccessLimiter, async (req, res) => {
  try {
    const { resourceName, resourceUrl, resourceType, storageType = 'local' } = req.body;
    const { courseId, lessonId } = req.params;
    const sequelize = req.app.get('sequelize');

    if (!sequelize) {
      return res.status(503).json({
        success: false,
        message: 'PostgreSQL not available',
      });
    }

    const resourceRecord = await postgresMediaUtils.saveCourseResource(sequelize, {
      mongoCourseId: courseId,
      mongoLessonId: lessonId,
      resourceName,
      resourceUrl,
      resourceType,
      storageType,
      uploadedBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      data: resourceRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload resource',
      error: error.message,
    });
  }
});

// ============================================
// EXAMPLE: Get Course with All Media
// ============================================
/**
 * GET /api/courses/:courseId/full
 * 
 * Returns:
 * {
 *   "course": { }, // From MongoDB
 *   "videos": [ ], // From PostgreSQL
 *   "resources": [ ] // From PostgreSQL
 * }
 */
router.get('/:courseId/full', courseFullLimiter, async (req, res) => {
  try {
    const sequelize = req.app.get('sequelize');

    // Get course metadata from MongoDB
    const course = await Course.findById(req.params.courseId)
      .populate('instructor', 'name email')
      .populate('students', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    let videos = [];
    let resources = [];

    // Get media from PostgreSQL if available
    if (sequelize) {
      try {
        [videos, resources] = await Promise.all([
          postgresMediaUtils.getCourseVideos(sequelize, req.params.courseId),
          postgresMediaUtils.getCourseResources(sequelize, req.params.courseId),
        ]);
      } catch (err) {
        console.warn('Failed to fetch media from PostgreSQL:', err.message);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        course,
        videos: {
          count: videos.length,
          data: videos,
        },
        resources: {
          count: resources.length,
          data: resources,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: error.message,
    });
  }
});

// ============================================
// EXAMPLE: Track Video Access
// ============================================
/**
 * POST /api/courses/:courseId/videos/:videoId/access
 * 
 * Increments access count and tracks when user watches video
 * Used for analytics and popular content tracking
 */
router.post('/:courseId/videos/:videoId/access', authMiddleware, videoAccessLimiter, async (req, res) => {
  try {
    const sequelize = req.app.get('sequelize');

    if (!sequelize) {
      return res.status(503).json({
        success: false,
        message: 'PostgreSQL not available',
      });
    }

    const media = await postgresMediaUtils.updateMediaAccessCount(sequelize, req.params.videoId);

    res.status(200).json({
      success: true,
      data: {
        videoId: req.params.videoId,
        accessCount: media?.accessCount || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to track access',
      error: error.message,
    });
  }
});

module.exports = router;

/**
 * ============================================
 * COURSE DATABASE DISTRIBUTION
 * ============================================
 * 
 * MongoDB (Course Metadata):
 * ✅ Course title, description, price
 * ✅ Instructor and students list
 * ✅ Module structure and lesson titles
 * ✅ Level, duration, category
 * ✅ Publishing status
 * 
 * PostgreSQL (Heavy Media):
 * ✅ Video URLs (all course videos)
 * ✅ Resource files (PDFs, documents)
 * ✅ Video processing status and metadata
 * ✅ Access tracking and analytics
 * ✅ File sizes and storage locations
 * 
 * ============================================
 * Query Examples:
 * ============================================
 * 
 * // Get all courses with instructor info (MongoDB)
 * const courses = await Course.find({})
 *   .populate('instructor', 'name email');
 * 
 * // Get all videos for a course (PostgreSQL)
 * const videos = await postgresMediaUtils.getCourseVideos(
 *   sequelize, 
 *   courseId
 * );
 * 
 * // Get resources for specific lesson (PostgreSQL)
 * const resources = await postgresMediaUtils.getCourseResources(
 *   sequelize, 
 *   courseId, 
 *   lessonId
 * );
 * 
 * // Find most accessed videos (PostgreSQL)
 * SELECT * FROM course_videos 
 * ORDER BY accessCount DESC 
 * LIMIT 10;
 * 
 * ============================================
 */
