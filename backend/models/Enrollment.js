const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'submitted', 'verified', 'rejected'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['jazzcash', 'easypaisa', 'bank-transfer', 'credit-card'],
    },
    paymentAmount: {
      type: Number,
      required: false,
    },
    paymentProof: {
      url: String,
      filename: String,
      uploadedAt: Date,
      storageType: {
        type: String,
        enum: ['local', 'google-drive'],
        default: 'local',
      },
    },
    transactionDetails: {
      accountNumber: String,
      accountName: String,
      transactionId: String,
      transactionDate: Date,
      notes: String,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate enrollment requests
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
