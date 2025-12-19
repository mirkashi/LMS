const Course = require('../models/Course');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

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

    // Handle image upload (frontend sends 'image', we store as 'thumbnail')
    if (req.files && req.files.image && req.files.image[0]) {
      course.thumbnail = `/uploads/${req.files.image[0].filename}`;
    }

    // Handle PDF files - store as resources in a dedicated module
    if (req.files && req.files.pdfFiles && req.files.pdfFiles.length > 0) {
      const pdfUrls = req.files.pdfFiles.map(file => `/uploads/${file.filename}`);
      
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
      lesson.videoUrl = `/uploads/${req.files.video[0].filename}`;
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
      .populate('items.course', 'title price')
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

    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }

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

    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
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
