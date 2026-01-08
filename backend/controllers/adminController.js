const Course = require('../models/Course');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Enrollment = require('../models/Enrollment');
const CourseAuditLog = require('../models/CourseAuditLog');
const PaymentStatusTracking = require('../models/PaymentStatusTracking');
const courseAuditController = require('./courseAuditController');
const paymentTrackingController = require('./paymentTrackingController');

const { sendEmailChangeVerification, sendPasswordChangeNotification } = require('../utils/mailer');
const crypto = require('crypto');

// Get All Courses (Admin) - includes unpublished courses
exports.getAllCourses = async (req, res) => {
  try {
    const { category, level, search, status } = req.query;
    let filter = {};

    // Filter by category
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Filter by level
    if (level && level !== 'all') {
      filter.level = level;
    }

    // Filter by publish status
    if (status === 'published') {
      filter.isPublished = true;
    } else if (status === 'draft') {
      filter.isPublished = false;
    }

    // Search filter
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
    console.error('Failed to fetch courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message,
    });
  }
};

// Get Single Course (Admin)
exports.getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate('instructor', 'name email avatar')
      .populate('students', 'name email');

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
    console.error('Failed to fetch course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: error.message,
    });
  }
};

// Create Course (Admin)
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, price, duration, level, syllabus, isPublished, introVideoLink } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!title || !description || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, and price',
      });
    }

    // Validate price is a valid number
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid non-negative number',
      });
    }

    const course = new Course({
      title,
      description,
      category,
      price: parsedPrice,
      duration: duration || 0,
      level: level || 'beginner',
      instructor: userId,
      modules: [],
      introVideoLink: introVideoLink || '',
      isPublished: isPublished === 'true' || isPublished === true, // Handle string 'true' from FormData
    });

    // Upload files to Google Drive with proper error handling
    const { uploadBufferToDrive, createFolderIfNotExists, isGoogleDriveConfigured } = require('../utils/googleDrive');

    // Create course folder (only if Google Drive is configured)
    let courseFolderId = null;
    const driveConfigured = isGoogleDriveConfigured();
    
    if (driveConfigured) {
      try {
        const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        if (rootFolderId) {
          courseFolderId = await createFolderIfNotExists(`course-${course._id}`, rootFolderId);
          console.log(`📁 Created Google Drive folder for course: ${course._id}`);
        }
      } catch (error) {
        console.warn('Failed to create course folder on Google Drive:', error.message);
        console.warn('Will save files locally instead');
        // Don't return error - continue with local storage
      }
    }

    // Handle image upload
    if (req.files && req.files.image && req.files.image[0]) {
      try {
        const img = req.files.image[0];
        const uploaded = await uploadBufferToDrive({
          buffer: img.buffer,
          name: `course-image-${Date.now()}-${img.originalname}`,
          mimeType: img.mimetype,
          folderId: courseFolderId
        });
        
        // Store the URL based on storage type
        if (uploaded.storageType === 'local') {
          // For local storage, use the relative path that backend serves
          course.thumbnail = uploaded.url; // e.g., /uploads/images/file.jpg
          course.thumbnailStorageType = 'local';
        } else {
          // For Google Drive, use the direct link
          course.thumbnail = uploaded.url || uploaded.webContentLink || `https://drive.google.com/uc?id=${uploaded.id}`;
          course.thumbnailStorageType = 'google-drive';
        }
        
        console.log(`✅ Course image uploaded successfully (${uploaded.storageType}): ${course.thumbnail}`);
      } catch (error) {
        console.error('Image upload error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload course image. Please try again.',
          error: error.message,
        });
      }
    }

    // Handle video upload
    if (req.files && req.files.video && req.files.video[0]) {
      try {
        const video = req.files.video[0];
        const uploaded = await uploadBufferToDrive({
          buffer: video.buffer,
          name: `course-intro-video-${Date.now()}-${video.originalname}`,
          mimeType: video.mimetype,
          folderId: courseFolderId
        });
        
        // Store the URL based on storage type
        if (uploaded.storageType === 'local') {
          course.introVideoUrl = uploaded.url;
          course.introVideoStorageType = 'local';
        } else {
          course.introVideoUrl = uploaded.url || uploaded.webContentLink || `https://drive.google.com/uc?id=${uploaded.id}`;
          course.introVideoStorageType = 'google-drive';
        }
        
        console.log(`✅ Course intro video uploaded successfully (${uploaded.storageType}): ${course.introVideoUrl}`);
      } catch (error) {
        console.error('Video upload error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload course video. Please try again.',
          error: error.message,
        });
      }
    }

    // Handle PDF files - store as resources in a dedicated module
    if (req.files && req.files.pdfFiles && req.files.pdfFiles.length > 0) {
      const pdfUrls = [];

      for (const file of req.files.pdfFiles) {
        try {
          const uploaded = await uploadBufferToDrive({
            buffer: file.buffer,
            name: `course-material-${Date.now()}-${file.originalname}`,
            mimeType: file.mimetype,
            folderId: courseFolderId
          });
          
          pdfUrls.push({
            url: uploaded.url || uploaded.webContentLink || `https://drive.google.com/uc?id=${uploaded.id}`,
            name: file.originalname,
            size: uploaded.size,
            type: file.mimetype,
            driveFileId: uploaded.id,
            storageType: uploaded.storageType || 'google-drive'
          });
          
          console.log(`✅ PDF uploaded: ${file.originalname} (${uploaded.storageType})`);
        } catch (error) {
          console.error('PDF upload error for %s:', file.originalname, error);
          return res.status(500).json({
            success: false,
            message: `Failed to upload PDF file: ${file.originalname}. Please try again.`,
            error: error.message,
          });
        }
      }
      
      // Create a module for course materials
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
      
      console.log(`✅ Created course materials module with ${pdfUrls.length} PDF(s)`);
    }

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    console.error('Course creation error:', error);
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
    const { title, description, category, price, duration, level, isPublished, introVideoLink } = req.body;
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

    // Track changes for audit log
    const changes = {
      before: {},
      after: {},
    };

    if (title && title !== course.title) {
      changes.before.title = course.title;
      changes.after.title = title;
      course.title = title;
    }
    
    if (description && description !== course.description) {
      changes.before.description = course.description;
      changes.after.description = description;
      course.description = description;
    }
    
    if (category && category !== course.category) {
      changes.before.category = course.category;
      changes.after.category = category;
      course.category = category;
    }
    
    if (price !== undefined && price !== course.price) {
      changes.before.price = course.price;
      changes.after.price = price;
      course.price = price;
    }
    
    if (duration !== undefined && duration !== course.duration) {
      changes.before.duration = course.duration;
      changes.after.duration = duration;
      course.duration = duration;
    }
    
    if (level && level !== course.level) {
      changes.before.level = course.level;
      changes.after.level = level;
      course.level = level;
    }
    
    if (isPublished !== undefined && isPublished !== course.isPublished) {
      changes.before.isPublished = course.isPublished;
      changes.after.isPublished = isPublished;
      course.isPublished = isPublished;
    }

    // Validate video link if provided
    if (introVideoLink && introVideoLink !== course.introVideoLink) {
      if (!courseAuditController.validateVideoUrl(introVideoLink)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid video URL format. Supported: YouTube, Vimeo, or direct MP4/WebM/OGG links',
        });
      }

      // Check for duplicates
      if (courseAuditController.checkDuplicateVideoLinks(course.modules, introVideoLink)) {
        console.warn('⚠️ Warning: This video link already exists in course modules');
      }

      changes.before.introVideoLink = course.introVideoLink;
      changes.after.introVideoLink = introVideoLink;
      course.introVideoLink = introVideoLink;
    }

    // Handle image upload (frontend sends 'image', we store as 'thumbnail')
    if (req.files && req.files.image && req.files.image[0]) {
      const { uploadBufferToDrive, createFolderIfNotExists, isGoogleDriveConfigured } = require('../utils/googleDrive');
      
      // Get or create course folder (only if Google Drive is configured)
      let courseFolderId = null;
      const driveConfigured = isGoogleDriveConfigured();
      
      if (driveConfigured) {
        try {
          const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
          if (rootFolderId) {
            courseFolderId = await createFolderIfNotExists(`course-${courseId}`, rootFolderId);
          }
        } catch (error) {
          console.warn('Failed to create course folder on Google Drive:', error.message);
        }
      }

      try {
        const img = req.files.image[0];
        const uploaded = await uploadBufferToDrive({
          buffer: img.buffer,
          name: `course-image-${Date.now()}-${img.originalname}`,
          mimeType: img.mimetype,
          folderId: courseFolderId
        });
        
        // Store the URL based on storage type
        if (uploaded.storageType === 'local') {
          course.thumbnail = uploaded.url;
          course.thumbnailStorageType = 'local';
        } else {
          course.thumbnail = uploaded.url || uploaded.webContentLink || `https://drive.google.com/uc?id=${uploaded.id}`;
          course.thumbnailStorageType = 'google-drive';
        }
        
        console.log(`✅ Course image updated (${uploaded.storageType}): ${course.thumbnail}`);
      } catch (error) {
        console.error('Image upload error:', error);
      }
    }

    // Handle video upload
    if (req.files && req.files.video && req.files.video[0]) {
      const { uploadBufferToDrive, createFolderIfNotExists, isGoogleDriveConfigured } = require('../utils/googleDrive');
      
      // Get or create course folder
      let courseFolderId = null;
      const driveConfigured = isGoogleDriveConfigured();
      
      if (driveConfigured) {
        try {
          const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
          if (rootFolderId) {
            courseFolderId = await createFolderIfNotExists(`course-${courseId}`, rootFolderId);
          }
        } catch (error) {
          console.warn('Failed to create course folder on Google Drive:', error.message);
        }
      }

      try {
        const video = req.files.video[0];
        const uploaded = await uploadBufferToDrive({
          buffer: video.buffer,
          name: `course-intro-video-${Date.now()}-${video.originalname}`,
          mimeType: video.mimetype,
          folderId: courseFolderId
        });
        
        // Store the URL based on storage type
        if (uploaded.storageType === 'local') {
          course.introVideoUrl = uploaded.url;
          course.introVideoStorageType = 'local';
        } else {
          course.introVideoUrl = uploaded.url || uploaded.webContentLink || `https://drive.google.com/uc?id=${uploaded.id}`;
          course.introVideoStorageType = 'google-drive';
        }
        
        console.log(`✅ Course intro video updated (${uploaded.storageType}): ${course.introVideoUrl}`);
      } catch (error) {
        console.error('Video upload error:', error);
      }
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

    // Log the changes to audit trail
    if (Object.keys(changes.after).length > 0) {
      await courseAuditController.logCourseChange(
        courseId,
        userId,
        'updated',
        changes,
        'Course updated via admin panel',
        req
      );
    }

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

    // Handle video link (external like YouTube/Vimeo)
    if (type === 'video' && req.body.videoLink) {
      lesson.videoLink = req.body.videoLink;
      lesson.videoStorageType = 'external';
      console.log(`✅ Video link added: ${req.body.videoLink}`);
    }
    // Handle video file upload
    else if (type === 'video' && req.files?.video) {
      const vid = req.files.video[0];
      const { uploadBufferToDrive, createFolderIfNotExists, isGoogleDriveConfigured } = require('../utils/googleDrive');

      // Get or create course folder (only if Google Drive is configured)
      let courseFolderId = null;
      const driveConfigured = isGoogleDriveConfigured();
      
      if (driveConfigured) {
        try {
          const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
          if (rootFolderId) {
            courseFolderId = await createFolderIfNotExists(`course-${courseId}`, rootFolderId);
          }
        } catch (error) {
          console.warn('Failed to create course folder on Google Drive:', error.message);
          console.warn('Will save video locally instead');
        }
      }

      try {
        const uploaded = await uploadBufferToDrive({
          buffer: vid.buffer,
          name: `lesson-video-${Date.now()}-${vid.originalname}`,
          mimeType: vid.mimetype,
          folderId: courseFolderId
        });
        
        // Store based on storage type
        lesson.videoDriveFileId = uploaded.id;
        lesson.videoStorageType = uploaded.storageType || 'google-drive';
        
        if (uploaded.storageType === 'local') {
          lesson.videoUrl = uploaded.url; // Direct URL for local files
        } else {
          lesson.videoUrl = `/api/media/drive/${uploaded.id}/stream`; // Stream URL for Drive
        }
        
        console.log(`✅ Video uploaded successfully: ${vid.originalname} (${uploaded.storageType})`);
      } catch (error) {
        console.error('Video upload error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload video. Please try again.',
          error: error.message,
        });
      }
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

// Update Lesson Release Date
exports.updateLessonReleaseDate = async (req, res) => {
  try {
    const { courseId, moduleIndex, lessonIndex } = req.params;
    const { releaseDate, isLocked } = req.body;
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
        message: 'Unauthorized',
      });
    }

    if (!course.modules[moduleIndex] || !course.modules[moduleIndex].lessons[lessonIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    // Update release date and lock status
    if (releaseDate) {
      course.modules[moduleIndex].lessons[lessonIndex].releaseDate = new Date(releaseDate);
    }
    if (typeof isLocked !== 'undefined') {
      course.modules[moduleIndex].lessons[lessonIndex].isLocked = isLocked;
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Lesson release date updated successfully',
      data: course.modules[moduleIndex].lessons[lessonIndex],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update lesson release date',
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
    
    // Calculate revenue from both orders and course enrollments
    const orderRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const enrollmentRevenue = await Enrollment.aggregate([
      { $match: { status: 'approved', paymentStatus: 'verified' } },
      { $group: { _id: null, total: { $sum: '$paymentAmount' } } },
    ]);

    const totalRevenue = (orderRevenue[0]?.total || 0) + (enrollmentRevenue[0]?.total || 0);

    // Get enrollment stats
    const totalEnrollments = await Enrollment.countDocuments({ status: 'approved' });
    const pendingEnrollments = await Enrollment.countDocuments({ status: 'pending' });

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent enrollments
    const recentEnrollments = await Enrollment.find({ status: 'approved' })
      .populate('user', 'name email')
      .populate('course', 'title price')
      .sort({ reviewedAt: -1 })
      .limit(10);

    // Get monthly revenue data for charts (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyEnrollmentRevenue = await Enrollment.aggregate([
      {
        $match: {
          status: 'approved',
          paymentStatus: 'verified',
          reviewedAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$reviewedAt' },
            month: { $month: '$reviewedAt' }
          },
          revenue: { $sum: '$paymentAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthlyOrderRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Merge monthly data
    const monthlyData = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    monthlyEnrollmentRevenue.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      if (!monthlyData[key]) {
        monthlyData[key] = { month: monthNames[item._id.month - 1], revenue: 0, enrollments: 0, orders: 0 };
      }
      monthlyData[key].revenue += item.revenue;
      monthlyData[key].enrollments = item.count;
    });

    monthlyOrderRevenue.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      if (!monthlyData[key]) {
        monthlyData[key] = { month: monthNames[item._id.month - 1], revenue: 0, enrollments: 0, orders: 0 };
      }
      monthlyData[key].revenue += item.revenue;
      monthlyData[key].orders = item.count;
    });

    const revenueChart = Object.values(monthlyData);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalOrders,
        totalRevenue,
        totalEnrollments,
        pendingEnrollments,
        recentOrders,
        recentEnrollments,
        revenueChart,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
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

// ==========================================
// ENROLLMENT MANAGEMENT
// ==========================================

// Get All Enrollment Requests
exports.getAllEnrollments = async (req, res) => {
  try {
    const { status, courseId, paymentStatus } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (courseId) filter.course = courseId;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const enrollments = await Enrollment.find(filter)
      .populate('user', 'name email phone avatar')
      .populate('course', 'title price category thumbnail')
      .populate('reviewedBy', 'name email')
      .sort({ requestedAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    console.error('Failed to fetch enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollment requests',
      error: error.message,
    });
  }
};

// Get Single Enrollment Request
exports.getEnrollmentById = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('user', 'name email phone avatar')
      .populate('course', 'title description price category level')
      .populate('reviewedBy', 'name email');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment request not found',
      });
    }

    res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    console.error('Failed to fetch enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollment request',
      error: error.message,
    });
  }
};

// Approve Enrollment Request
exports.approveEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const adminId = req.user.userId;

    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment request not found',
      });
    }

    if (enrollment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve enrollment that is already ${enrollment.status}`,
      });
    }

    // Ensure paymentAmount is set from course price if missing
    if (!enrollment.paymentAmount) {
      const course = await Course.findById(enrollment.course);
      if (course) {
        enrollment.paymentAmount = course.price;
      }
    }

    // Update enrollment status
    enrollment.status = 'approved';
    enrollment.paymentStatus = 'verified';
    enrollment.reviewedAt = new Date();
    enrollment.reviewedBy = adminId;
    await enrollment.save();

    // Track payment status
    await paymentTrackingController.trackPaymentStatus(
      enrollmentId,
      'approved',
      {
        approvedBy: adminId
      }
    );

    // Add user to course students
    const course = await Course.findById(enrollment.course);
    if (!course.students.includes(enrollment.user)) {
      course.students.push(enrollment.user);
      await course.save();
    }

    // Add course to user's enrolled courses
    const user = await User.findById(enrollment.user);
    if (!user.enrolledCourses.includes(enrollment.course)) {
      user.enrolledCourses.push(enrollment.course);
      await user.save();
    }

    // Populate enrollment details for response
    await enrollment.populate('user', 'name email');
    await enrollment.populate('course', 'title');

    res.status(200).json({
      success: true,
      message: `✅ Enrollment approved for ${enrollment.user.name} in ${enrollment.course.title}`,
      data: enrollment,
    });
  } catch (error) {
    console.error('Failed to approve enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve enrollment request',
      error: error.message,
    });
  }
};

// Reject Enrollment Request
exports.rejectEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { reason, rejectionReason } = req.body;
    const adminId = req.user.userId;

    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment request not found',
      });
    }

    if (enrollment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject enrollment that is already ${enrollment.status}`,
      });
    }

    // Update enrollment status
    enrollment.status = 'rejected';
    enrollment.paymentStatus = 'rejected';
    enrollment.reviewedAt = new Date();
    enrollment.reviewedBy = adminId;
    enrollment.rejectionReason = reason || rejectionReason || 'No reason provided';
    await enrollment.save();

    // Track payment status with rejection reason
    await paymentTrackingController.trackPaymentStatus(
      enrollmentId,
      'rejected',
      {
        rejectedBy: adminId,
        rejectionReason: rejectionReason || 'payment_rejected',
        rejectionNotes: reason || rejectionReason || 'No additional notes'
      }
    );

    // Populate enrollment details for response
    await enrollment.populate('user', 'name email');
    await enrollment.populate('course', 'title');

    res.status(200).json({
      success: true,
      message: `❌ Enrollment rejected for ${enrollment.user.name} in ${enrollment.course.title}`,
      data: enrollment,
    });
  } catch (error) {
    console.error('Failed to reject enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject enrollment request',
      error: error.message,
    });
  }
};

module.exports = exports;
