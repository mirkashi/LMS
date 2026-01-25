const Course = require('../models/Course');
const User = require('../models/User');
const Review = require('../models/Review');
const Enrollment = require('../models/Enrollment');

// Get All Courses
exports.getAllCourses = async (req, res) => {
  try {
    const { category, level, search } = req.query;
    let filter = { isPublished: true };

    // Whitelist allowed category and level values to avoid using arbitrary user input in the query
    const allowedCategories = ['development', 'design', 'business', 'marketing', 'photography', 'music'];
    const allowedLevels = ['beginner', 'intermediate', 'advanced', 'all'];

    if (category && category !== 'all' && allowedCategories.includes(category)) {
      // Use $eq to ensure the value is treated as a literal and not as a query object
      filter.category = { $eq: category };
    }

    if (level && level !== 'all' && allowedLevels.includes(level)) {
      // Use $eq to ensure the value is treated as a literal and not as a query object
      filter.level = { $eq: level };
    }

    if (typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = search.trim();
      filter.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const courses = await Course.find(filter)
      .populate('instructor', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message,
    });
  }
};

// Get Single Course
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId; // Optional authentication

    const course = await Course.findById(id)
      .populate('instructor', 'name email avatar bio')
      .populate('students', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if user is enrolled
    let isEnrolled = false;
    let enrollmentStatus = null;

    if (userId) {
      // Check if user has approved enrollment
      const enrollment = await Enrollment.findOne({
        user: userId,
        course: id,
      });

      if (enrollment) {
        enrollmentStatus = enrollment.status;
        isEnrolled = enrollment.status === 'approved';
      }
    }

    // Prepare course data with access control
    const courseData = {
      _id: course._id,
      title: course.title,
      description: course.description,
      category: course.category,
      price: course.price,
      thumbnail: course.thumbnail,
      duration: course.duration,
      level: course.level,
      rating: course.rating,
      totalRatings: course.totalRatings,
      instructor: course.instructor,
      students: course.students,
      isEnrolled,
      enrollmentStatus,
      introVideoLink: course.introVideoLink, // Show intro video link to all users
      introVideoUrl: course.introVideoUrl, // Show uploaded intro video to all users
      introVideoStorageType: course.introVideoStorageType,
      createdAt: course.createdAt,
    };

    // If user is enrolled (approved), provide full course content
    if (isEnrolled) {
      // Filter lessons based on release date
      const currentDate = new Date();
      courseData.modules = course.modules.map((module) => ({
        ...module.toObject(),
        lessons: module.lessons.map((lesson) => {
          const lessonObj = lesson.toObject ? lesson.toObject() : lesson;
          
          // Check if lesson is locked by release date
          if (lessonObj.releaseDate && new Date(lessonObj.releaseDate) > currentDate) {
            return {
              ...lessonObj,
              isLocked: true,
              videoUrl: null,
              videoLink: null,
              pdfUrl: null,
              content: null,
              resources: [],
              lockedMessage: `This lesson will be available on ${new Date(lessonObj.releaseDate).toLocaleDateString()}`,
            };
          }
          
          return lessonObj;
        }),
      }));
    } else {
      // Provide only preview/outline of modules without actual content
      courseData.modules = course.modules.map((module) => ({
        title: module.title,
        description: module.description,
        order: module.order,
        lessonCount: module.lessons?.length || 0,
        // Don't include actual lessons for non-enrolled users
      }));
    }

    res.status(200).json({
      success: true,
      data: courseData,
    });
  } catch (error) {
    console.error('Failed to fetch course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: error.message,
    });
  }
};

// Get Course Reviews
exports.getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;

    const reviews = await Review.find({ course: courseId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

// Post Review
exports.postReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rating',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      user: userId,
      course: courseId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this course',
      });
    }

    const review = new Review({
      user: userId,
      course: courseId,
      rating,
      comment,
    });

    await review.save();
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting review',
      error: error.message,
    });
  }
};

// Request Enrollment in Course with Payment
exports.requestEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { 
      paymentMethod, 
      paymentAmount, 
      accountNumber, 
      accountName, 
      transactionId, 
      transactionDate,
      notes 
    } = req.body;
    const userId = req.user.userId;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Validate payment amount matches course price
    if (parseFloat(paymentAmount) !== parseFloat(course.price)) {
      return res.status(400).json({
        success: false,
        message: `Payment amount must match course price: ${course.price}`,
      });
    }

    // Check if enrollment request already exists
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: `Enrollment request already ${existingEnrollment.status}`,
        enrollmentStatus: existingEnrollment.status,
      });
    }

    // Handle payment proof upload
    let paymentProof = null;
    if (req.file) {
      const { uploadBufferToDrive, isGoogleDriveConfigured } = require('../utils/googleDrive');
      
      try {
        const uploaded = await uploadBufferToDrive({
          buffer: req.file.buffer,
          name: `payment-proof-${userId}-${courseId}-${Date.now()}-${req.file.originalname}`,
          mimeType: req.file.mimetype,
        });

        paymentProof = {
          url: uploaded.url,
          filename: req.file.originalname,
          uploadedAt: new Date(),
          storageType: uploaded.storageType || 'local',
        };
      } catch (error) {
        console.error('Failed to upload payment proof:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload payment proof. Please try again.',
          error: error.message,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment proof screenshot is required',
      });
    }

    // Create new enrollment request with payment
    const enrollment = new Enrollment({
      user: userId,
      course: courseId,
      status: 'pending',
      paymentStatus: 'submitted',
      paymentMethod,
      paymentAmount,
      paymentProof,
      transactionDetails: {
        accountNumber,
        accountName,
        transactionId,
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
        notes,
      },
    });

    await enrollment.save();

    res.status(201).json({
      success: true,
      message: 'Enrollment request with payment proof submitted successfully. Awaiting admin approval.',
      data: enrollment,
    });
  } catch (error) {
    console.error('Failed to request enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request enrollment',
      error: error.message,
    });
  }
};

// Enroll in Course
exports.enrollCourse = async (req, res) => {
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

    // Check if user already enrolled
    if (course.students.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course',
      });
    }

    course.students.push(userId);
    await course.save();

    const user = await User.findById(userId);
    user.enrolledCourses.push(courseId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Enrolled in course successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course',
      error: error.message,
    });
  }
};

// Get User Enrolled Courses
exports.getUserEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).populate('enrolledCourses');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      count: user.enrolledCourses.length,
      data: user.enrolledCourses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled courses',
      error: error.message,
    });
  }
};

module.exports = exports;
