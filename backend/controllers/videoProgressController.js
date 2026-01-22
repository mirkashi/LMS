const VideoProgress = require('../models/VideoProgress');
const Course = require('../models/Course');

// Record or update video progress
exports.updateVideoProgress = async (req, res) => {
  try {
    const { courseId, videoLink, duration, currentTime, isCompleted } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!courseId || !videoLink) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and video link are required',
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

    // Calculate percentage watched
    const percentageWatched = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;

    // Find existing progress
    let progress = await VideoProgress.findOne({
      user: userId,
      course: courseId,
      videoLink,
    });

    if (progress) {
      // Update existing progress
      progress.duration = duration || progress.duration;
      progress.currentTime = currentTime;
      progress.percentageWatched = percentageWatched;
      progress.isCompleted = isCompleted || (percentageWatched >= 90);
      progress.lastWatchedAt = new Date();
      progress.totalTimeSpent = (progress.totalTimeSpent || 0) + (currentTime - progress.currentTime);
      await progress.save();
    } else {
      // Create new progress record
      progress = new VideoProgress({
        user: userId,
        course: courseId,
        videoLink,
        duration,
        currentTime,
        percentageWatched,
        isCompleted: isCompleted || (percentageWatched >= 90),
        lastWatchedAt: new Date(),
        watchStartedAt: new Date(),
        totalTimeSpent: 0,
      });
      await progress.save();
    }

    await progress.populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Video progress updated successfully',
      data: progress,
    });
  } catch (error) {
    console.error('Update video progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update video progress',
      error: error.message,
    });
  }
};

// Get video progress for a specific course
exports.getVideoProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    const progress = await VideoProgress.find({
      user: userId,
      course: courseId,
    }).populate('user', 'name email');

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Get video progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video progress',
      error: error.message,
    });
  }
};

// Get progress for a specific video
exports.getVideoProgressByLink = async (req, res) => {
  try {
    const { courseId, videoLink } = req.params;
    const userId = req.user.userId;

    const progress = await VideoProgress.findOne({
      user: userId,
      course: courseId,
      videoLink: decodeURIComponent(videoLink),
    }).populate('user', 'name email');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Video progress not found',
      });
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Get video progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video progress',
      error: error.message,
    });
  }
};

// Get all video progress (admin only)
exports.getAllVideoProgress = async (req, res) => {
  try {
    const { courseId } = req.query;

    // Validate courseId to prevent NoSQL injection via query parameters
    if (courseId !== undefined && typeof courseId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid courseId parameter',
      });
    }

    let query = {};
    if (typeof courseId === 'string' && courseId.length > 0) {
      // Use $eq to ensure courseId is treated as a literal value
      query.course = { $eq: courseId };
    }

    const progress = await VideoProgress.find(query)
      .populate('user', 'name email')
      .populate('course', 'title');

    res.status(200).json({
      success: true,
      data: progress,
      total: progress.length,
    });
  } catch (error) {
    console.error('Get all video progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video progress',
      error: error.message,
    });
  }
};

// Get course video completion statistics (admin only)
exports.getCourseVideoStatistics = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const progress = await VideoProgress.find({ course: courseId })
      .populate('user', 'name email');

    // Calculate statistics
    const totalRecords = progress.length;
    const completedCount = progress.filter(p => p.isCompleted).length;
    const avgPercentage = totalRecords > 0
      ? Math.round(progress.reduce((sum, p) => sum + p.percentageWatched, 0) / totalRecords)
      : 0;

    const statistics = {
      courseId,
      courseTitle: course.title,
      totalWatchers: totalRecords,
      completedCount,
      completionRate: totalRecords > 0 ? ((completedCount / totalRecords) * 100).toFixed(2) : 0,
      averagePercentageWatched: avgPercentage,
      details: progress.map(p => ({
        userId: p.user._id,
        userName: p.user.name,
        userEmail: p.user.email,
        videoLink: p.videoLink,
        percentageWatched: p.percentageWatched,
        isCompleted: p.isCompleted,
        totalTimeSpent: p.totalTimeSpent,
        lastWatchedAt: p.lastWatchedAt,
      })),
    };

    res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error('Get course statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course statistics',
      error: error.message,
    });
  }
};

// Delete video progress
exports.deleteVideoProgress = async (req, res) => {
  try {
    const { progressId } = req.params;

    const progress = await VideoProgress.findByIdAndDelete(progressId);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Video progress not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Video progress deleted successfully',
      data: progress,
    });
  } catch (error) {
    console.error('Delete video progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete video progress',
      error: error.message,
    });
  }
};
