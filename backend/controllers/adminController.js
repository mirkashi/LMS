const Course = require('../models/Course');
const User = require('../models/User');
const Order = require('../models/Order');

// Create Course (Admin)
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, price, duration, level } = req.body;
    const instructorId = req.user.userId;

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
      instructor: instructorId,
      modules: [],
    });

    if (req.file) {
      course.thumbnail = `/uploads/${req.file.filename}`;
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

    if (req.file) {
      course.thumbnail = `/uploads/${req.file.filename}`;
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

module.exports = exports;
