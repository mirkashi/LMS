const Enrollment = require('../models/Enrollment');
const PaymentStatusTracking = require('../models/PaymentStatusTracking');
const User = require('../models/User');
const Course = require('../models/Course');

/**
 * Initialize or update payment status tracking
 */
exports.trackPaymentStatus = async (enrollmentId, status, details = {}) => {
  try {
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('user')
      .populate('course');

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    let tracking = await PaymentStatusTracking.findOne({ enrollment: enrollmentId });

    if (!tracking) {
      tracking = new PaymentStatusTracking({
        enrollment: enrollmentId,
        user: enrollment.user._id,
        course: enrollment.course._id,
        amount: enrollment.paymentAmount,
        paymentMethod: enrollment.paymentMethod,
        status: status,
      });
    } else {
      tracking.status = status;
    }

    // Set timestamps based on status
    if (status === 'approved') {
      tracking.approvedAt = new Date();
      tracking.approvedBy = details.approvedBy;
      tracking.canRetry = false;
    } else if (status === 'rejected') {
      tracking.rejectedAt = new Date();
      tracking.rejectedBy = details.rejectedBy;
      tracking.rejectionReason = details.rejectionReason;
      tracking.rejectionNotes = details.rejectionNotes;
      tracking.nextRetryAfter = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours later
    }

    await tracking.save();
    console.log(`✅ Payment tracking updated: ${enrollmentId} -> ${status}`);
    return tracking;
  } catch (error) {
    console.error('Failed to track payment status:', error);
    throw error;
  }
};

/**
 * Get payment status for a user
 */
exports.getUserPaymentStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, limit = 20, page = 1 } = req.query;

    let filter = { user: userId };
    if (status) {
      filter.status = status;
    }

    const payments = await PaymentStatusTracking.find(filter)
      .populate('course', 'title price category')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await PaymentStatusTracking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Failed to fetch payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status',
      error: error.message,
    });
  }
};

/**
 * Get all rejected payments (admin)
 */
exports.getRejectedPayments = async (req, res) => {
  try {
    const { reason, limit = 50, page = 1 } = req.query;

    let filter = { status: 'rejected' };
    if (reason) {
      filter.rejectionReason = reason;
    }

    const payments = await PaymentStatusTracking.find(filter)
      .populate('enrollment')
      .populate('course', 'title price')
      .populate('user', 'name email')
      .populate('rejectedBy', 'name')
      .sort({ rejectedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await PaymentStatusTracking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Failed to fetch rejected payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rejected payments',
      error: error.message,
    });
  }
};

/**
 * Request payment retry
 */
exports.requestPaymentRetry = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.userId;

    const payment = await PaymentStatusTracking.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    if (payment.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to retry this payment',
      });
    }

    // Check if retry is allowed
    if (!payment.canRetry) {
      return res.status(400).json({
        success: false,
        message: 'Retry is not available for this payment',
      });
    }

    if (payment.retryCount >= payment.maxRetries) {
      return res.status(400).json({
        success: false,
        message: `Maximum retries (${payment.maxRetries}) exceeded. Please contact support.`,
      });
    }

    // Check if enough time has passed since last retry
    if (payment.nextRetryAfter && new Date() < payment.nextRetryAfter) {
      return res.status(400).json({
        success: false,
        message: `Please wait until ${payment.nextRetryAfter.toISOString()} before retrying`,
        nextRetryAfter: payment.nextRetryAfter,
      });
    }

    // Reset for retry
    payment.status = 'pending';
    payment.retryCount += 1;
    payment.lastRetryAt = new Date();
    payment.nextRetryAfter = new Date(Date.now() + 24 * 60 * 60 * 1000);
    payment.rejectedAt = null;
    payment.rejectionReason = null;
    payment.rejectionNotes = null;

    // Also update the enrollment status
    const enrollment = await Enrollment.findById(payment.enrollment);
    if (enrollment) {
      enrollment.status = 'pending';
      enrollment.paymentStatus = 'pending';
      await enrollment.save();
    }

    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment retry initiated. Please resubmit payment details.',
      data: payment,
    });
  } catch (error) {
    console.error('Failed to request payment retry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request payment retry',
      error: error.message,
    });
  }
};

/**
 * Get payment statistics (admin)
 */
exports.getPaymentStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const [
      totalPayments,
      approvedCount,
      rejectedCount,
      pendingCount,
      totalAmount,
      approvedAmount,
      rejectedReasons,
    ] = await Promise.all([
      PaymentStatusTracking.countDocuments(dateFilter),
      PaymentStatusTracking.countDocuments({ ...dateFilter, status: 'approved' }),
      PaymentStatusTracking.countDocuments({ ...dateFilter, status: 'rejected' }),
      PaymentStatusTracking.countDocuments({ ...dateFilter, status: 'pending' }),
      PaymentStatusTracking.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      PaymentStatusTracking.aggregate([
        { $match: { ...dateFilter, status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      PaymentStatusTracking.aggregate([
        { $match: { ...dateFilter, status: 'rejected' } },
        { $group: { _id: '$rejectionReason', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPayments,
        approvedCount,
        rejectedCount,
        pendingCount,
        approvalRate: totalPayments > 0 ? ((approvedCount / totalPayments) * 100).toFixed(2) + '%' : '0%',
        rejectionRate: totalPayments > 0 ? ((rejectedCount / totalPayments) * 100).toFixed(2) + '%' : '0%',
        totalAmount: totalAmount[0]?.total || 0,
        approvedAmount: approvedAmount[0]?.total || 0,
        rejectionReasons: rejectedReasons,
      },
    });
  } catch (error) {
    console.error('Failed to fetch payment statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics',
      error: error.message,
    });
  }
};

/**
 * Auto-categorize enrollment based on payment status
 */
exports.categorizeEnrollmentByPaymentStatus = async (enrollmentId) => {
  try {
    const enrollment = await Enrollment.findById(enrollmentId);
    const payment = await PaymentStatusTracking.findOne({ enrollment: enrollmentId });

    if (!enrollment || !payment) {
      return null;
    }

    // Update enrollment status based on payment status
    switch (payment.status) {
      case 'approved':
        enrollment.status = 'approved';
        enrollment.paymentStatus = 'verified';
        break;
      case 'rejected':
        enrollment.status = 'rejected';
        enrollment.paymentStatus = 'rejected';
        break;
      case 'pending':
      default:
        enrollment.status = 'pending';
        enrollment.paymentStatus = 'pending';
        break;
    }

    await enrollment.save();
    console.log(`✅ Enrollment categorized: ${enrollmentId} -> ${enrollment.status}`);
    return enrollment;
  } catch (error) {
    console.error('Failed to categorize enrollment:', error);
    throw error;
  }
};
