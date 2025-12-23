const mongoose = require('mongoose');

const productReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    status: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved',
      index: true,
    },
  },
  { timestamps: true }
);

productReviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('ProductReview', productReviewSchema);
