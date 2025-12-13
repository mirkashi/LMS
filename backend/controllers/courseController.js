const Course = require('../models/Course');
const User = require('../models/User');
const Review = require('../models/Review');

// Get All Courses
exports.getAllCourses = async (req, res) => {
  try {
    const { category, level, search } = req.query;
    let filter = { isPublished: true };

    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
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

    const course = await Course.findById(id)
      .populate('instructor', 'name email avatar bio')
      .populate('students', 'name email')
      .populate({
        path: 'modules.lessons',
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
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
      course: courseId,
      user: userId,
    });

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();

      return res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: existingReview,
      });
    }

    const review = new Review({
      course: courseId,
      user: userId,
      rating,
      comment,
    });

    await review.save();

    // Update course rating
    const allReviews = await Review.find({ course: courseId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    course.rating = avgRating;
    course.totalRatings = allReviews.length;
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Review posted successfully',
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to post review',
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
