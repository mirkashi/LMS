const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: 0,
    },
    thumbnail: String,
    duration: Number, // in hours
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    modules: [
      {
        title: String,
        description: String,
        order: Number,
        lessons: [
          {
            title: String,
            description: String,
            order: Number,
            type: {
              type: String,
              enum: ['video', 'pdf', 'text'],
            },
            videoUrl: String,
            videoDriveFileId: String,
            pdfUrl: String,
            content: String,
            duration: Number, // in minutes
            resources: [{
              url: String,
              name: String,
              size: Number,
              type: String,
              driveFileId: String
            }],
          },
        ],
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Course', courseSchema);
