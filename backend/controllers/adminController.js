const Course = require('../models/Course');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

const { sendEmailChangeVerification, sendPasswordChangeNotification } = require('../utils/mailer');
const crypto = require('crypto');

// Create Course (Admin)
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, price, duration, level, syllabus } = req.body;
    const userId = req.user.userId;

    if (!title || !description || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const course = new Course({
      title,
      description,
      category,
      price,
      duration: duration || 0,
      level: level || 'beginner',
      instructor: userId, // Use logged-in admin as instructor ID
      modules: [],
    });

    // Upload image and PDFs to Google Drive
    const { uploadBufferToDrive } = require('../utils/googleDrive');

    // Handle image upload (frontend sends 'image', we store Drive link)
    if (req.files && req.files.image && req.files.image[0]) {
      const img = req.files.image[0];
      const uploaded = await uploadBufferToDrive({
        buffer: img.buffer,
        name: img.originalname,
        mimeType: img.mimetype,
        folderId: process.env.GOOGLE_DRIVE_IMAGE_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID
      });
      // Prefer webContentLink if public, else store ID for streaming later
      course.thumbnail = uploaded.webContentLink || `https://drive.google.com/uc?id=${uploaded.id}`;
    }

    // Handle PDF files - store as resources in a dedicated module
    if (req.files && req.files.pdfFiles && req.files.pdfFiles.length > 0) {
      const pdfUrls = [];
      for (const file of req.files.pdfFiles) {
        const uploaded = await uploadBufferToDrive({
          buffer: file.buffer,
          name: file.originalname,
          mimeType: file.mimetype,
          folderId: process.env.GOOGLE_DRIVE_PDF_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID
        });
        pdfUrls.push(uploaded.webContentLink || `https://drive.google.com/uc?id=${uploaded.id}`);
      }
      
      // Create a module for course materials with unique identifier
      const MATERIALS_MODULE_TITLE = '__course_materials__';
      course.modules.push({
        title: MATERIALS_MODULE_TITLE,
        description: 'Downloadable course materials and resources',
        order: 0,
        lessons: [{
          title: 'Course Resources',
          description: syllabus || 'Course materials and resources',
          order: 0,
          type: 'pdf',
          resources: pdfUrls
        }]
      });
    }

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message,
    });
  }
};

// Update Course
exports.updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, category, price, duration, level, isPublished } = req.body;
    const userId = req.user.userId;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.instructor.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this course',
      });
    }

    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (price !== undefined) course.price = price;
    if (duration !== undefined) course.duration = duration;
    if (level) course.level = level;
    if (isPublished !== undefined) course.isPublished = isPublished;

    // Handle image upload (frontend sends 'image', we store as 'thumbnail')
    if (req.files && req.files.image && req.files.image[0]) {
      course.thumbnail = `/uploads/${req.files.image[0].filename}`;
    }

    // Handle PDF files - add/update resources in course materials module
    if (req.files && req.files.pdfFiles && req.files.pdfFiles.length > 0) {
      const pdfUrls = req.files.pdfFiles.map(file => `/uploads/${file.filename}`);
      
      // Use the same unique identifier as in createCourse
      const MATERIALS_MODULE_TITLE = '__course_materials__';
      
      // Find or create course materials module
      let materialsModule = course.modules.find(m => m.title === MATERIALS_MODULE_TITLE);
      if (materialsModule) {
        // Update existing module
        if (materialsModule.lessons && materialsModule.lessons.length > 0) {
          materialsModule.lessons[0].resources = pdfUrls;
        }
      } else {
        // Create new materials module
        course.modules.push({
          title: MATERIALS_MODULE_TITLE,
          description: 'Downloadable course materials and resources',
          order: course.modules.length,
          lessons: [{
            title: 'Course Resources',
            description: 'Course materials and resources',
            order: 0,
            type: 'pdf',
            resources: pdfUrls
          }]
        });
      }
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message,
    });
  }
};

// Get Admin Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('-password -newEmailVerificationToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
};

// Update Admin Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { email, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let message = 'Profile updated successfully';
    let emailVerificationRequired = false;

    // Handle Email Change Request
    if (email && email !== user.email) {
      // Rate limiting check (1 minute)
      if (user.lastEmailVerificationSentAt && 
          Date.now() - user.lastEmailVerificationSentAt.getTime() < 60000) {
        return res.status(429).json({
          success: false,
          message: 'Please wait a minute before requesting another verification code',
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }

      // Generate 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedCode = crypto.createHash('sha256').update(verificationCode).digest('hex');

      user.newEmail = email;
      user.newEmailVerificationToken = hashedCode;
      user.newEmailVerificationExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
      user.lastEmailVerificationSentAt = Date.now();

      await sendEmailChangeVerification(email, verificationCode);
      emailVerificationRequired = true;
      message = 'Verification code sent to new email';
    }

    // Handle Password Change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Please provide current password to set a new password',
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid current password',
        });
      }

      // Password strength validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
        });
      }

      user.password = newPassword;
      await sendPasswordChangeNotification(user.email);
      message = emailVerificationRequired ? message + ' and password updated' : 'Password updated successfully';
    }

    await user.save();

    // Remove sensitive data
    user.password = undefined;
    user.newEmailVerificationToken = undefined;

    res.status(200).json({
      success: true,
      message,
      emailVerificationRequired,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

// Verify Email Change
exports.verifyEmailChange = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required',
      });
    }

    const user = await User.findById(userId);

    if (!user || !user.newEmailVerificationToken || !user.newEmailVerificationExpires) {
      return res.status(400).json({
        success: false,
        message: 'No pending email change found',
      });
    }

    if (user.newEmailVerificationExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired',
      });
    }

    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    if (hashedCode !== user.newEmailVerificationToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code',
      });
    }

    // Update email
    user.email = user.newEmail;
    user.newEmail = undefined;
    user.newEmailVerificationToken = undefined;
    user.newEmailVerificationExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email updated successfully',
      data: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify email change',
      error: error.message,
    });
  }
};

// Delete Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.instructor.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this course',
      });
    }

    await Course.findByIdAndDelete(courseId);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message,
    });
  }
};

// Add Module
exports.addModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, order } = req.body;
    const userId = req.user.userId;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide module title',
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.instructor.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const module = {
      title,
      description,
      order: order || course.modules.length + 1,
      lessons: [],
    };

    course.modules.push(module);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Module added successfully',
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add module',
      error: error.message,
    });
  }
};

// Add Lesson
exports.addLesson = async (req, res) => {
  try {
    const { courseId, moduleIndex } = req.params;
    const { title, description, type, duration, order } = req.body;
    const userId = req.user.userId;

    if (!title || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide lesson title and type',
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.instructor.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const lesson = {
      title,
      description,
      type,
      order: order || course.modules[moduleIndex].lessons.length + 1,
      duration: duration || 0,
      resources: [],
    };

    if (type === 'video' && req.files?.video) {
      const vid = req.files.video[0];
      const { uploadBufferToDrive } = require('../utils/googleDrive');
      const uploaded = await uploadBufferToDrive({
        buffer: vid.buffer,
        name: vid.originalname,
        mimeType: vid.mimetype,
        folderId: process.env.GOOGLE_DRIVE_VIDEO_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID
      });
      // Store drive id and a stream URL via backend
      lesson.videoDriveFileId = uploaded.id;
      lesson.videoUrl = `/api/media/drive/${uploaded.id}/stream`;
    }

    if (type === 'pdf' && req.files?.pdf) {
      lesson.pdfUrl = `/uploads/${req.files.pdf[0].filename}`;
    }

    if (type === 'text') {
      lesson.content = req.body.content || '';
    }

    course.modules[moduleIndex].lessons.push(lesson);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Lesson added successfully',
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add lesson',
      error: error.message,
    });
  }
};

// Get All Orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.course', 'title price thumbnail')
      .populate('items.product', 'name price image images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
};

// Update Order Status (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    // Emit order update event
    const io = req.app.get('io');
    io.emit('order-update', {
      orderId: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus
    });

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message,
    });
  }
};

// Get Admin Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message,
    });
  }
};

// Get All Users (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

// Delete User (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

// Create Product (Admin)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock } = req.body;
    const adminId = req.user.userId;

    if (!name || !description || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const product = new Product({
      name,
      description,
      category,
      price,
      stock: stock || 0,
      createdBy: adminId,
    });

    // Support multi-image uploads (require at least 5 images)
    if (!Array.isArray(req.files) || req.files.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least 5 product images',
      });
    }

    const urls = req.files.map((f) => `/uploads/${f.filename}`);
    product.images = urls;
    // Keep legacy field set to the first image for older clients
    product.image = urls[0];

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
    });
  }
};

// Get All Products (Admin)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
};

// Get Single Product by ID (Admin)
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId)
      .populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
};

// Update Product (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, description, category, price, stock, isAvailable } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (isAvailable !== undefined) product.isAvailable = isAvailable;

    // Support multi-image uploads
    // If a new set of images is uploaded, require at least 5.
    if (Array.isArray(req.files) && req.files.length > 0) {
      if (req.files.length < 5) {
        return res.status(400).json({
          success: false,
          message: 'Please upload at least 5 product images',
        });
      }

      const urls = req.files.map((f) => `/uploads/${f.filename}`);
      product.images = urls;
      // Keep legacy field set to the first image for older clients
      product.image = urls[0];
    }

    product.updatedAt = Date.now();
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
};

// Delete Product (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message,
    });
  }
};

module.exports = exports;
