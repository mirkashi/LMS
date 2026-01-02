const mongoose = require('mongoose');

const enrollmentProgressSchema = new mongoose.Schema(
  {
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
    },
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
    lessonProgress: [
      {
        moduleIndex: Number,
        lessonIndex: Number,
        lessonId: String,
        status: {
          type: String,
          enum: ['not-started', 'in-progress', 'completed'],
          default: 'not-started',
        },
        watchTime: {
          type: Number,
          default: 0, // in seconds
        },
        totalDuration: Number, // in seconds
        completionPercentage: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        lastAccessedAt: Date,
        completedAt: Date,
      },
    ],
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalWatchTime: {
      type: Number,
      default: 0, // in seconds
    },
    lastAccessedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one progress record per enrollment
enrollmentProgressSchema.index({ enrollment: 1, user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('EnrollmentProgress', enrollmentProgressSchema);
