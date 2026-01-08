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
    thumbnailStorageType: {
      type: String,
      enum: ['local', 'google-drive'],
      default: 'google-drive',
    },
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
    introVideoLink: {
      type: String,
      description: 'Video link (YouTube, Vimeo, or direct URL) to be shown upon enrollment',
    },
    introVideoUrl: {
      type: String,
      description: 'Uploaded intro video URL (stored on server or Google Drive)',
    },
    introVideoStorageType: {
      type: String,
      enum: ['local', 'google-drive'],
      default: 'google-drive',
    },
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
            videoLink: String, // External video link (YouTube, Vimeo, etc.)
            videoDriveFileId: String,
            videoStorageType: {
              type: String,
              enum: ['local', 'google-drive', 'external'],
              default: 'google-drive',
            },
            pdfUrl: String,
            content: String,
            duration: Number, // in minutes
            releaseDate: {
              type: Date,
              description: 'Date when this lesson becomes available to enrolled students',
            },
            isLocked: {
              type: Boolean,
              default: false,
              description: 'If true, lesson is locked until releaseDate',
            },
            resources: [
              new mongoose.Schema({
                url: String,
                name: String,
                size: Number,
                type: String,
                driveFileId: String,
                storageType: {
                  type: String,
                  enum: ['local', 'google-drive'],
                  default: 'google-drive',
                }
              }, { _id: false })
            ],
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
