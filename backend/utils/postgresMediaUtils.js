/**
 * PostgreSQL Media Management Utilities
 * Handles storing and retrieving heavy/large media content
 */

/**
 * Save product image metadata to PostgreSQL
 */
const saveProductImage = async (sequelize, imageData) => {
  if (!sequelize) {
    throw new Error('PostgreSQL not enabled');
  }
  
  const { ProductImage } = sequelize.models || {};
  if (!ProductImage) {
    throw new Error('ProductImage model not initialized');
  }

  try {
    const image = await ProductImage.create({
      mongoProductId: imageData.mongoProductId,
      imageUrl: imageData.imageUrl,
      imagePath: imageData.imagePath,
      storageType: imageData.storageType || 'local',
      googleDriveFileId: imageData.googleDriveFileId,
      fileSize: imageData.fileSize,
      mimeType: imageData.mimeType,
      altText: imageData.altText,
      isMainImage: imageData.isMainImage || false,
      uploadedBy: imageData.uploadedBy,
    });

    return image;
  } catch (error) {
    console.error('Error saving product image to PostgreSQL:', error);
    throw error;
  }
};

/**
 * Get all images for a product
 */
const getProductImages = async (sequelize, mongoProductId) => {
  if (!sequelize) {
    throw new Error('PostgreSQL not enabled');
  }

  const { ProductImage } = sequelize.models || {};
  if (!ProductImage) {
    throw new Error('ProductImage model not initialized');
  }

  try {
    const images = await ProductImage.findAll({
      where: { mongoProductId },
      order: [['isMainImage', 'DESC'], ['createdAt', 'ASC']],
    });

    return images;
  } catch (error) {
    console.error('Error fetching product images from PostgreSQL:', error);
    throw error;
  }
};

/**
 * Save course video metadata to PostgreSQL
 */
const saveCourseVideo = async (sequelize, videoData) => {
  if (!sequelize) {
    throw new Error('PostgreSQL not enabled');
  }

  const { CourseVideo } = sequelize.models || {};
  if (!CourseVideo) {
    throw new Error('CourseVideo model not initialized');
  }

  try {
    const video = await CourseVideo.create({
      mongoCourseId: videoData.mongoCourseId,
      videoType: videoData.videoType,
      mongoLessonId: videoData.mongoLessonId,
      videoUrl: videoData.videoUrl,
      videoPath: videoData.videoPath,
      storageType: videoData.storageType || 'local',
      googleDriveFileId: videoData.googleDriveFileId,
      externalUrl: videoData.externalUrl,
      fileSize: videoData.fileSize,
      mimeType: videoData.mimeType,
      duration: videoData.duration,
      thumbnail: videoData.thumbnail,
      uploadedBy: videoData.uploadedBy,
      isProcessed: videoData.isProcessed || true,
      processingStatus: videoData.processingStatus || 'completed',
    });

    return video;
  } catch (error) {
    console.error('Error saving course video to PostgreSQL:', error);
    throw error;
  }
};

/**
 * Get all videos for a course
 */
const getCourseVideos = async (sequelize, mongoCourseId) => {
  if (!sequelize) {
    throw new Error('PostgreSQL not enabled');
  }

  const { CourseVideo } = sequelize.models || {};
  if (!CourseVideo) {
    throw new Error('CourseVideo model not initialized');
  }

  try {
    const videos = await CourseVideo.findAll({
      where: { mongoCourseId },
      order: [['createdAt', 'ASC']],
    });

    return videos;
  } catch (error) {
    console.error('Error fetching course videos from PostgreSQL:', error);
    throw error;
  }
};

/**
 * Save course resource metadata to PostgreSQL
 */
const saveCourseResource = async (sequelize, resourceData) => {
  if (!sequelize) {
    throw new Error('PostgreSQL not enabled');
  }

  const { CourseResource } = sequelize.models || {};
  if (!CourseResource) {
    throw new Error('CourseResource model not initialized');
  }

  try {
    const resource = await CourseResource.create({
      mongoCourseId: resourceData.mongoCourseId,
      mongoLessonId: resourceData.mongoLessonId,
      resourceName: resourceData.resourceName,
      resourceUrl: resourceData.resourceUrl,
      resourcePath: resourceData.resourcePath,
      storageType: resourceData.storageType || 'local',
      googleDriveFileId: resourceData.googleDriveFileId,
      resourceType: resourceData.resourceType || 'other',
      fileSize: resourceData.fileSize,
      mimeType: resourceData.mimeType,
      uploadedBy: resourceData.uploadedBy,
    });

    return resource;
  } catch (error) {
    console.error('Error saving course resource to PostgreSQL:', error);
    throw error;
  }
};

/**
 * Get all resources for a course or lesson
 */
const getCourseResources = async (sequelize, mongoCourseId, mongoLessonId = null) => {
  if (!sequelize) {
    throw new Error('PostgreSQL not enabled');
  }

  const { CourseResource } = sequelize.models || {};
  if (!CourseResource) {
    throw new Error('CourseResource model not initialized');
  }

  try {
    const where = { mongoCourseId };
    if (mongoLessonId) {
      where.mongoLessonId = mongoLessonId;
    }

    const resources = await CourseResource.findAll({
      where,
      order: [['createdAt', 'ASC']],
    });

    return resources;
  } catch (error) {
    console.error('Error fetching course resources from PostgreSQL:', error);
    throw error;
  }
};

/**
 * Save generic media to PostgreSQL
 */
const saveMediaStorage = async (sequelize, mediaData) => {
  if (!sequelize) {
    throw new Error('PostgreSQL not enabled');
  }

  const { MediaStorage } = sequelize.models || {};
  if (!MediaStorage) {
    throw new Error('MediaStorage model not initialized');
  }

  try {
    const media = await MediaStorage.create({
      referenceId: mediaData.referenceId,
      referenceType: mediaData.referenceType,
      mediaType: mediaData.mediaType,
      fileName: mediaData.fileName,
      mediaUrl: mediaData.mediaUrl,
      mediaPath: mediaData.mediaPath,
      storageType: mediaData.storageType || 'local',
      googleDriveFileId: mediaData.googleDriveFileId,
      fileSize: mediaData.fileSize,
      mimeType: mediaData.mimeType,
      width: mediaData.width,
      height: mediaData.height,
      duration: mediaData.duration,
      checksum: mediaData.checksum,
      uploadedBy: mediaData.uploadedBy,
      isPublic: mediaData.isPublic || false,
    });

    return media;
  } catch (error) {
    console.error('Error saving media to PostgreSQL:', error);
    throw error;
  }
};

/**
 * Get media by reference
 */
const getMediaByReference = async (sequelize, referenceId, referenceType, mediaType = null) => {
  if (!sequelize) {
    throw new Error('PostgreSQL not enabled');
  }

  const { MediaStorage } = sequelize.models || {};
  if (!MediaStorage) {
    throw new Error('MediaStorage model not initialized');
  }

  try {
    const where = { referenceId, referenceType };
    if (mediaType) {
      where.mediaType = mediaType;
    }

    const media = await MediaStorage.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    return media;
  } catch (error) {
    console.error('Error fetching media from PostgreSQL:', error);
    throw error;
  }
};

/**
 * Update media access count (for tracking popular content)
 */
const updateMediaAccessCount = async (sequelize, mediaId) => {
  if (!sequelize) {
    throw new Error('PostgreSQL not enabled');
  }

  const { MediaStorage } = sequelize.models || {};
  if (!MediaStorage) {
    throw new Error('MediaStorage model not initialized');
  }

  try {
    const media = await MediaStorage.findByPk(mediaId);
    if (media) {
      media.accessCount += 1;
      media.lastAccessedAt = new Date();
      await media.save();
      return media;
    }
    return null;
  } catch (error) {
    console.error('Error updating media access count:', error);
    throw error;
  }
};

/**
 * Delete media from PostgreSQL
 */
const deleteMedia = async (sequelize, mediaId) => {
  if (!sequelize) {
    throw new Error('PostgreSQL not enabled');
  }

  const { MediaStorage } = sequelize.models || {};
  if (!MediaStorage) {
    throw new Error('MediaStorage model not initialized');
  }

  try {
    const deleted = await MediaStorage.destroy({
      where: { id: mediaId },
    });

    return deleted > 0;
  } catch (error) {
    console.error('Error deleting media from PostgreSQL:', error);
    throw error;
  }
};

module.exports = {
  saveProductImage,
  getProductImages,
  saveCourseVideo,
  getCourseVideos,
  saveCourseResource,
  getCourseResources,
  saveMediaStorage,
  getMediaByReference,
  updateMediaAccessCount,
  deleteMedia,
};
