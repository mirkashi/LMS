const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'ProductImage',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      mongoProductId: {
        type: DataTypes.STRING,
        allowNull: false,
        index: true,
        comment: 'Reference to MongoDB Product._id',
      },
      imageUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Full image URL or file path',
      },
      imagePath: {
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
      fileSize: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'File size in bytes',
      },
      mimeType: {
        type: DataTypes.STRING,
        defaultValue: 'image/jpeg',
        comment: 'MIME type of the image',
      },
      altText: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Alt text for accessibility',
      },
      isMainImage: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Flag if this is the main product image',
      },
      uploadedBy: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'MongoDB User ID who uploaded the image',
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
      tableName: 'product_images',
      timestamps: true,
      indexes: [
        { fields: ['mongoProductId'] },
        { fields: ['storageType'] },
        { fields: ['createdAt'] },
      ],
    }
  );
};
