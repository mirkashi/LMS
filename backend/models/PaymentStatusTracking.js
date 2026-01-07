const mongoose = require('mongoose');

const paymentStatusTrackingSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'refunded'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      enum: [
        'insufficient_funds',
        'card_declined',
        'expired_card',
        'incorrect_details',
        'fraud_detected',
        'duplicate_transaction',
        'bank_error',
        'other'
      ]
    },
    rejectionNotes: String,
    paymentMethod: {
      type: String,
      enum: ['jazzcash', 'easypaisa', 'bank-transfer', 'credit-card'],
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    lastRetryAt: Date,
    nextRetryAfter: Date,
    canRetry: {
      type: Boolean,
      default: true,
    },
    approvedAt: Date,
    rejectedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

// Indexes for efficient querying
paymentStatusTrackingSchema.index({ user: 1, status: 1 });
paymentStatusTrackingSchema.index({ enrollment: 1 });
paymentStatusTrackingSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('PaymentStatusTracking', paymentStatusTrackingSchema);
