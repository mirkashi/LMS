const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'CourseVideo',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      mongoCourseId: {
        type: DataTypes.STRING,
        allowNull: false,
        index: true,
        comment: 'Reference to MongoDB Course._id',
      },
      videoType: {
        type: DataTypes.ENUM('intro', 'lesson', 'module'),
        allowNull: false,
      },
      mongoLessonId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Reference to lesson ID if applicable',
      },
      videoUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Full video URL or file path',
      },
      videoPath: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Local file path if stored locally',
      },
      storageType: {
        type: DataTypes.ENUM('local', 'google-drive', 'external', 'cloud'),
        defaultValue: 'local',
      },
      googleDriveFileId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Google Drive file ID if stored on Drive',
      },
      externalUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'External video URL (YouTube, Vimeo, etc.)',
      },
      fileSize: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'File size in bytes',
      },
      mimeType: {
        type: DataTypes.STRING,
        defaultValue: 'video/mp4',
        comment: 'MIME type of the video',
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Video duration in seconds',
      },
      thumbnail: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Thumbnail image URL',
      },
      uploadedBy: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'MongoDB User ID who uploaded the video',
      },
      isProcessed: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Whether video has been processed/transcoded',
      },
      processingStatus: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
        defaultValue: 'completed',
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'course_videos',
      timestamps: true,
      indexes: [
        { fields: ['mongoCourseId'] },
        { fields: ['videoType'] },
        { fields: ['storageType'] },
        { fields: ['createdAt'] },
      ],
    }
  );
};
