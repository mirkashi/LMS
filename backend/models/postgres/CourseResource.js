const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'CourseResource',
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
      mongoLessonId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Reference to lesson ID if applicable',
      },
      resourceName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Name of the resource',
      },
      resourceUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Full resource URL or file path',
      },
      resourcePath: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Local file path if stored locally',
      },
      storageType: {
        type: DataTypes.ENUM('local', 'google-drive', 'cloud'),
        defaultValue: 'local',
      },
      googleDriveFileId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Google Drive file ID if stored on Drive',
      },
      resourceType: {
        type: DataTypes.ENUM('pdf', 'document', 'image', 'archive', 'code', 'other'),
        defaultValue: 'other',
      },
      fileSize: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'File size in bytes',
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'MIME type of the resource',
      },
      uploadedBy: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'MongoDB User ID who uploaded the resource',
      },
      accessCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Number of times the resource has been accessed',
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
      tableName: 'course_resources',
      timestamps: true,
      indexes: [
        { fields: ['mongoCourseId'] },
        { fields: ['resourceType'] },
        { fields: ['storageType'] },
        { fields: ['createdAt'] },
      ],
    }
  );
};
