const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'MediaStorage',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      referenceId: {
        type: DataTypes.STRING,
        allowNull: false,
        index: true,
        comment: 'MongoDB reference ID (Product/Course/User ID)',
      },
      referenceType: {
        type: DataTypes.ENUM('product', 'course', 'user', 'page', 'announcement'),
        allowNull: false,
      },
      mediaType: {
        type: DataTypes.ENUM('image', 'video', 'document', 'audio', 'archive'),
        allowNull: false,
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Original file name',
      },
      mediaUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Full media URL or file path',
      },
      mediaPath: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Local file path if stored locally',
      },
      storageType: {
        type: DataTypes.ENUM('local', 'google-drive', 'cloud', 's3'),
        defaultValue: 'local',
      },
      googleDriveFileId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Google Drive file ID',
      },
      fileSize: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'File size in bytes',
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'MIME type of the file',
      },
      width: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Image width in pixels',
      },
      height: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Image height in pixels',
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Video/Audio duration in seconds',
      },
      checksum: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'File checksum/hash for integrity checking',
      },
      uploadedBy: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'MongoDB User ID who uploaded the media',
      },
      accessCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Number of times the media has been accessed',
      },
      lastAccessedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Last time this media was accessed',
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether media is publicly accessible',
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
      tableName: 'media_storage',
      timestamps: true,
      indexes: [
        { fields: ['referenceId', 'referenceType'] },
        { fields: ['mediaType'] },
        { fields: ['storageType'] },
        { fields: ['createdAt'] },
        { fields: ['fileSize'] },
      ],
    }
  );
};
