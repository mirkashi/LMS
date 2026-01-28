const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize = null;
let models = {};

const initializeDatabase = async () => {
  if (sequelize) {
    return { sequelize, models };
  }

  const pgEnabled = String(process.env.DB_ENABLED || 'true') !== 'false';

  if (!pgEnabled) {
    console.log('ℹ️ PostgreSQL disabled via DB_ENABLED=false');
    return { sequelize: null, models: {} };
  }

  try {
    // Initialize Sequelize
    sequelize = new Sequelize(
      process.env.DB_NAME || 'ebay lms',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'password',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }
    );

    // Import models
    models.ProductImage = require('./ProductImage')(sequelize);
    models.CourseVideo = require('./CourseVideo')(sequelize);
    models.CourseResource = require('./CourseResource')(sequelize);
    models.MediaStorage = require('./MediaStorage')(sequelize);

    // Test connection
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');

    // Sync models with database - force drop and recreate to fix schema issues
    await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
    console.log('✅ PostgreSQL models synchronized');

    return { sequelize, models };
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }
    throw error;
  }
};

module.exports = { initializeDatabase, sequelize, models };
