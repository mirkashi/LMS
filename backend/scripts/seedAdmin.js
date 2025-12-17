/**
 * Admin Seeding Script
 * Run this script to create the initial admin user
 * 
 * Usage: node scripts/seedAdmin.js
 * 
 * Admin Credentials:
 * Email: admin@lmsplatform.com
 * Password: Admin@12345
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/9tangle';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@lmsplatform.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('\nTo reset password, update the database directly or use forgot-password endpoint');
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const adminData = {
      name: 'Admin',
      email: 'admin@lmsplatform.com',
      password: 'Admin@12345',
      role: 'admin',
      isEmailVerified: true, // Auto-verify admin
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 ADMIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    admin@lmsplatform.com');
    console.log('Password: Admin@12345');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✨ Login at: http://localhost:3001/login');
    console.log('\n⚠️  IMPORTANT:');
    console.log('   - Change these credentials immediately after first login');
    console.log('   - Use a strong, unique password');
    console.log('   - Keep admin email secure');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
