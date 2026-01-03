const mongoose = require('mongoose');

const pageBackgroundSchema = new mongoose.Schema(
  {
    pageName: {
      type: String,
      enum: ['course', 'shop', 'contact'],
      unique: true,
      required: [true, 'Please specify which page this background is for'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Please provide an image URL'],
    },
    imageDriveFileId: {
      type: String,
    },
    storageType: {
      type: String,
      enum: ['local', 'google-drive'],
      default: 'google-drive',
    },
    fileName: String,
    fileSize: Number,
    mimeType: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    alt: {
      type: String,
      default: 'Page background image',
    },
    description: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PageBackground', pageBackgroundSchema);
