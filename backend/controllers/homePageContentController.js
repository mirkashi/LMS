const HomePageContent = require('../models/HomePageContent');
const { uploadBufferToDrive, createFolderIfNotExists, isGoogleDriveConfigured } = require('../utils/googleDrive');

const HERO_IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const HERO_IMAGE_ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

exports.getHomePageContent = async (req, res) => {
  try {
    const content = await HomePageContent.findOne().sort({ updatedAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: content || null,
    });
  } catch (error) {
    console.error('Get homepage content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch homepage content',
      error: error.message,
    });
  }
};

exports.upsertHomePageContent = async (req, res) => {
  try {
    const userId = req.user?.userId;

    const {
      heroBadgeText,
      heroTitle,
      heroSubtitle,
      heroPrimaryCtaLabel,
      heroPrimaryCtaHref,
      heroSecondaryCtaLabel,
      heroSecondaryCtaHref,
    } = req.body;

    const update = {
      updatedBy: userId,
    };

    if (typeof heroBadgeText === 'string') update.heroBadgeText = heroBadgeText;
    if (typeof heroTitle === 'string') update.heroTitle = heroTitle;
    if (typeof heroSubtitle === 'string') update.heroSubtitle = heroSubtitle;
    if (typeof heroPrimaryCtaLabel === 'string') update.heroPrimaryCtaLabel = heroPrimaryCtaLabel;
    if (typeof heroPrimaryCtaHref === 'string') update.heroPrimaryCtaHref = heroPrimaryCtaHref;
    if (typeof heroSecondaryCtaLabel === 'string') update.heroSecondaryCtaLabel = heroSecondaryCtaLabel;
    if (typeof heroSecondaryCtaHref === 'string') update.heroSecondaryCtaHref = heroSecondaryCtaHref;

    // Optional hero image upload
    if (req.file) {
      if (!HERO_IMAGE_ALLOWED_MIMES.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Only JPG, PNG, and WebP images are supported',
        });
      }

      if (req.file.size > HERO_IMAGE_MAX_SIZE) {
        return res.status(400).json({
          success: false,
          message: 'File size must not exceed 5MB',
        });
      }

      let homepageFolder = null;
      const driveConfigured = isGoogleDriveConfigured();

      if (driveConfigured) {
        try {
          const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
          if (rootFolderId) {
            homepageFolder = await createFolderIfNotExists('homepage', rootFolderId);
          }
        } catch (error) {
          console.warn('Failed to create homepage folder on Google Drive:', error.message);
        }
      }

      const uploadedData = await uploadBufferToDrive({
        buffer: req.file.buffer,
        name: `homepage-hero-${Date.now()}-${req.file.originalname}`,
        mimeType: req.file.mimetype,
        folderId: homepageFolder,
        subfolder: 'homepage',
      });

      let heroImageUrl;
      if (uploadedData.storageType === 'local') {
        heroImageUrl = uploadedData.url;
      } else {
        heroImageUrl = uploadedData.url || uploadedData.webContentLink || `https://drive.google.com/uc?id=${uploadedData.id}`;
      }

      update.heroImageUrl = heroImageUrl;
      update.heroImageDriveFileId = uploadedData.id || null;
      update.heroImageStorageType = uploadedData.storageType || '';
      update.heroImageFileName = req.file.originalname;
      update.heroImageFileSize = req.file.size;
      update.heroImageMimeType = req.file.mimetype;
    }

    const updated = await HomePageContent.findOneAndUpdate(
      {},
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('updatedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Homepage content updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Upsert homepage content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update homepage content',
      error: error.message,
    });
  }
};
