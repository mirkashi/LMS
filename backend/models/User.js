const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
      default: null, // Password set later during registration flow
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    emailVerificationCode: String, // Hashed 6-digit code
    emailVerificationCodeExpires: Date,
    emailVerificationAttempts: {
      type: Number,
      default: 0,
    },
    lastEmailVerificationSentAt: Date,
    newEmail: String,
    newEmailVerificationToken: String,
    newEmailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordResetCode: String, // Hashed 6-digit code for password reset
    passwordResetCodeExpires: Date,
    passwordResetAttempts: {
      type: Number,
      default: 0,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
    },
    avatar: String,
    bio: String,
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    cart: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (only if password exists)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
  const token = require('crypto').randomBytes(32).toString('hex');
  this.emailVerificationToken = require('crypto').createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// Method to generate 6-digit verification code
userSchema.methods.generateVerificationCode = function () {
  const crypto = require('crypto');
  // Generate secure random 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();
  // Hash the code before storing
  this.emailVerificationCode = crypto.createHash('sha256').update(code).digest('hex');
  this.emailVerificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  this.emailVerificationAttempts = 0; // Reset attempts
  return code;
};

// Method to verify 6-digit code
userSchema.methods.verifyCode = function (code) {
  const crypto = require('crypto');
  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
  return (
    this.emailVerificationCode === hashedCode &&
    this.emailVerificationCodeExpires > Date.now()
  );
};

// Method to generate password reset code
userSchema.methods.generatePasswordResetCode = function () {
  const crypto = require('crypto');
  const code = crypto.randomInt(100000, 999999).toString();
  this.passwordResetCode = crypto.createHash('sha256').update(code).digest('hex');
  this.passwordResetCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  this.passwordResetAttempts = 0; // Reset attempts
  return code;
};

// Method to verify password reset code
userSchema.methods.verifyPasswordResetCode = function (code) {
  const crypto = require('crypto');
  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
  return (
    this.passwordResetCode === hashedCode &&
    this.passwordResetCodeExpires > Date.now()
  );
};

// Method to verify email token
userSchema.methods.verifyEmailToken = function (token) {
  const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');
  return (
    this.emailVerificationToken === hashedToken &&
    this.emailVerificationExpires > Date.now()
  );
};

module.exports = mongoose.model('User', userSchema);
