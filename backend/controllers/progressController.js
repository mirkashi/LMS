const EnrollmentProgress = require('../models/EnrollmentProgress');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// Get or create progress for an enrollment
exports.getProgress = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const userId = req.user.userId;

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    // Verify user owns this enrollment
    if (enrollment.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    let progress = await EnrollmentProgress.findOne({ enrollment: enrollmentId });

    // Create progress record if doesn't exist
    if (!progress) {
      progress = new EnrollmentProgress({
        enrollment: enrollmentId,
        user: userId,
        course: enrollment.course,
        lessonProgress: [],
        overallProgress: 0,
        totalWatchTime: 0,
      });
      await progress.save();
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get progress',
      error: error.message,
    });
  }
};

// Update lesson progress
exports.updateLessonProgress = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { moduleIndex, lessonIndex, watchTime, totalDuration, status } = req.body;
    const userId = req.user.userId;

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    // Verify user owns this enrollment
    if (enrollment.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    let progress = await EnrollmentProgress.findOne({ enrollment: enrollmentId });

    // Create progress record if doesn't exist
    if (!progress) {
      progress = new EnrollmentProgress({
        enrollment: enrollmentId,
        user: userId,
        course: enrollment.course,
        lessonProgress: [],
        overallProgress: 0,
        totalWatchTime: 0,
      });
    }

    // Find or create lesson progress
    const lessonId = `${moduleIndex}-${lessonIndex}`;
    let lessonProgress = progress.lessonProgress.find(
      (lp) => lp.moduleIndex === moduleIndex && lp.lessonIndex === lessonIndex
    );

    if (!lessonProgress) {
      lessonProgress = {
        moduleIndex,
        lessonIndex,
        lessonId,
        status: 'not-started',
        watchTime: 0,
        completionPercentage: 0,
      };
      progress.lessonProgress.push(lessonProgress);
    }

    // Update lesson progress
    if (watchTime !== undefined) {
      lessonProgress.watchTime = watchTime;
    }
    if (totalDuration !== undefined) {
      lessonProgress.totalDuration = totalDuration;
    }
    if (status) {
      lessonProgress.status = status;
    }

    // Calculate completion percentage
    if (lessonProgress.totalDuration > 0) {
      lessonProgress.completionPercentage = Math.min(
        100,
        Math.round((lessonProgress.watchTime / lessonProgress.totalDuration) * 100)
      );

      // Auto-mark as completed if watched 90% or more
      if (lessonProgress.completionPercentage >= 90 && lessonProgress.status !== 'completed') {
        lessonProgress.status = 'completed';
        lessonProgress.completedAt = new Date();
      }
    }

    lessonProgress.lastAccessedAt = new Date();

    // Calculate overall progress
    const course = await Course.findById(enrollment.course);
    let totalLessons = 0;
    let completedLessons = 0;
    let totalWatchTime = 0;

    course.modules.forEach((module, mIdx) => {
      module.lessons.forEach((lesson, lIdx) => {
        totalLessons++;
        const lp = progress.lessonProgress.find(
          (p) => p.moduleIndex === mIdx && p.lessonIndex === lIdx
        );
        if (lp) {
          totalWatchTime += lp.watchTime || 0;
          if (lp.status === 'completed') {
            completedLessons++;
          }
        }
      });
    });

    progress.overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    progress.totalWatchTime = totalWatchTime;
    progress.lastAccessedAt = new Date();

    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated',
      data: progress,
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message,
    });
  }
};

// Get progress statistics for admin
exports.getEnrollmentProgressStats = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const progress = await EnrollmentProgress.findOne({ enrollment: enrollmentId })
      .populate('user', 'name email')
      .populate('course', 'title');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'No progress data found',
      });
    }

    const stats = {
      user: progress.user,
      course: progress.course,
      overallProgress: progress.overallProgress,
      totalWatchTime: progress.totalWatchTime,
      totalWatchTimeFormatted: formatDuration(progress.totalWatchTime),
      completedLessons: progress.lessonProgress.filter((lp) => lp.status === 'completed').length,
      totalLessons: progress.lessonProgress.length,
      lastAccessedAt: progress.lastAccessedAt,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get progress stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get progress stats',
      error: error.message,
    });
  }
};

// Helper function to format duration
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

module.exports = exports;
