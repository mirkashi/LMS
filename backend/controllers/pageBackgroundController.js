const PageBackground = require('../models/PageBackground');
const { uploadBufferToDrive, createFolderIfNotExists, isGoogleDriveConfigured } = require('../utils/googleDrive');

// Get background image for a specific page
exports.getPageBackground = async (req, res) => {
  try {
    const { pageName } = req.params;

    // Validate page name
    if (!['course', 'shop', 'contact'].includes(pageName)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page name. Must be one of: course, shop, contact',
      });
    }

    const background = await PageBackground.findOne({ pageName }).populate('uploadedBy', 'name email');

    if (!background) {
      return res.status(404).json({
        success: false,
        message: `No background image found for ${pageName} page`,
      });
    }

    res.status(200).json({
      success: true,
      data: background,
    });
  } catch (error) {
    console.error('Get page background error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch page background',
      error: error.message,
    });
  }
};

// Get all page backgrounds
exports.getAllPageBackgrounds = async (req, res) => {
  try {
    const backgrounds = await PageBackground.find().populate('uploadedBy', 'name email');

    res.status(200).json({
      success: true,
      data: backgrounds,
      total: backgrounds.length,
    });
  } catch (error) {
    console.error('Get all page backgrounds error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch page backgrounds',
      error: error.message,
    });
  }
};

// Upload or update page background image
exports.uploadPageBackground = async (req, res) => {
  try {
    const { pageName } = req.params; // Get from URL params, not body
    const { alt, description } = req.body;
    const userId = req.user.userId;

    console.log('Upload request - pageName:', pageName, 'file:', req.file?.filename, 'user:', userId);

    // Validate required fields
    if (!pageName || !['course', 'shop', 'contact'].includes(pageName)) {
      console.error('Invalid page name:', pageName);
      return res.status(400).json({
        success: false,
        message: 'Invalid page name. Must be one of: course, shop, contact',
      });
    }

    if (!req.file) {
      console.error('No file received in request');
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file',
      });
    }

    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(req.file.mimetype)) {
      console.error('Invalid MIME type:', req.file.mimetype);
      return res.status(400).json({
        success: false,
        message: 'Only JPG, PNG, and WebP images are supported',
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      console.error('File too large:', req.file.size, 'bytes');
      return res.status(400).json({
        success: false,
        message: 'File size must not exceed 5MB',
      });
    }

    let backgroundFolder = null;
    const driveConfigured = isGoogleDriveConfigured();

    // Create background images folder if Google Drive is configured
    if (driveConfigured) {
      try {
        const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        if (rootFolderId) {
          backgroundFolder = await createFolderIfNotExists('page-backgrounds', rootFolderId);
        }
      } catch (error) {
        console.warn('Failed to create background folder on Google Drive:', error.message);
      }
    }

    // Upload to Google Drive or local storage
    let uploadedData = null;
    try {
      uploadedData = await uploadBufferToDrive({
        buffer: req.file.buffer,
        name: `${pageName}-background-${Date.now()}-${req.file.originalname}`,
        mimeType: req.file.mimetype,
        folderId: backgroundFolder,
      });
    } catch (error) {
      console.error('File upload error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image. Please try again.',
        error: error.message,
      });
    }

    // Prepare image URL
    let imageUrl;
    if (uploadedData.storageType === 'local') {
      imageUrl = uploadedData.url;
    } else {
      imageUrl = uploadedData.url || uploadedData.webContentLink || `https://drive.google.com/uc?id=${uploadedData.id}`;
    }

    // Check if background already exists for this page
    let background = await PageBackground.findOne({ pageName });

    if (background) {
      // Update existing background
      background.imageUrl = imageUrl;
      background.imageDriveFileId = uploadedData.id || null;
      background.storageType = uploadedData.storageType;
      background.fileName = req.file.originalname;
      background.fileSize = req.file.size;
      background.mimeType = req.file.mimetype;
      background.uploadedBy = userId;
      if (alt) background.alt = alt;
      if (description) background.description = description;
      await background.save();
    } else {
      // Create new background
      background = new PageBackground({
        pageName,
        imageUrl,
        imageDriveFileId: uploadedData.id || null,
        storageType: uploadedData.storageType,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: userId,
        alt: alt || `${pageName} page background`,
        description,
      });
      await background.save();
    }

    // Populate user info
    await background.populate('uploadedBy', 'name email');

    console.log(`✅ ${pageName} page background uploaded successfully:`, background._id);

    res.status(200).json({
      success: true,
      message: `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} page background uploaded successfully`,
      data: background,
    });
  } catch (error) {
    console.error('Upload page background error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload page background',
      error: error.message,
    });
  }
};

// Delete page background
exports.deletePageBackground = async (req, res) => {
  try {
    const { pageName } = req.params;

    if (!['course', 'shop', 'contact'].includes(pageName)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page name. Must be one of: course, shop, contact',
      });
    }

    const background = await PageBackground.findOneAndDelete({ pageName });

    if (!background) {
      return res.status(404).json({
        success: false,
        message: `No background image found for ${pageName} page`,
      });
    }

    res.status(200).json({
      success: true,
      message: `${pageName} page background deleted successfully`,
      data: background,
    });
  } catch (error) {
    console.error('Delete page background error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete page background',
      error: error.message,
    });
  }
};
