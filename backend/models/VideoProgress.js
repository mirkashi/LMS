const mongoose = require('mongoose');

const videoProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    videoLink: {
      type: String,
      required: true,
      description: 'The video link being tracked',
    },
    duration: {
      type: Number,
      default: 0,
      description: 'Total video duration in seconds',
    },
    currentTime: {
      type: Number,
      default: 0,
      description: 'Current playback time in seconds',
    },
    percentageWatched: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      description: 'Percentage of video watched (0-100)',
    },
    isCompleted: {
      type: Boolean,
      default: false,
      description: 'Whether the user has watched the entire video (typically > 90%)',
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
    watchStartedAt: {
      type: Date,
      default: Date.now,
    },
    totalTimeSpent: {
      type: Number,
      default: 0,
      description: 'Total time spent watching in seconds',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to ensure only one progress record per user-course-video
videoProgressSchema.index({ user: 1, course: 1, videoLink: 1 }, { unique: true });

module.exports = mongoose.model('VideoProgress', videoProgressSchema);
