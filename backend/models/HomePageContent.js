const mongoose = require('mongoose');

const homePageContentSchema = new mongoose.Schema(
  {
    heroBadgeText: { type: String, default: '🚀 #1 Platform for eBay Sellers' },
    heroTitle: { type: String, default: 'Master the Art of Online Selling' },
    heroSubtitle: {
      type: String,
      default:
        'Unlock your potential with expert-led courses, premium resources, and a community of successful entrepreneurs.',
    },

    heroPrimaryCtaLabel: { type: String, default: 'Start Learning' },
    heroPrimaryCtaHref: { type: String, default: '/courses' },
    heroSecondaryCtaLabel: { type: String, default: 'Browse Shop' },
    heroSecondaryCtaHref: { type: String, default: '/shop' },

    heroImageUrl: { type: String, default: '' },
    heroImageDriveFileId: { type: String, default: null },
    heroImageStorageType: {
      type: String,
      enum: ['google-drive', 'local', ''],
      default: '',
    },
    heroImageFileName: { type: String, default: '' },
    heroImageFileSize: { type: Number, default: 0 },
    heroImageMimeType: { type: String, default: '' },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomePageContent', homePageContentSchema);
