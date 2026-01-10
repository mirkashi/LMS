const mongoose = require('mongoose');

const dailyVideoLinkSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title for the video link'],
      trim: true,
    },
    videoLink: {
      type: String,
      required: [true, 'Please provide a video link'],
    },
    description: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
dailyVideoLinkSchema.index({ course: 1, date: -1 });
dailyVideoLinkSchema.index({ course: 1, isActive: 1, date: -1 });

module.exports = mongoose.model('DailyVideoLink', dailyVideoLinkSchema);
