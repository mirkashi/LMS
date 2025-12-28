const jwt = require('jsonwebtoken');

// Ensure JWT_SECRET is loaded from environment
const JWT_SECRET = process.env.JWT_SECRET || '46496b47f8fa05837a4b367bac06c32b2d4959f9e3271b23b7fe14f2d0c61311';

// Warn if using default secret
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: Using default JWT_SECRET. Set JWT_SECRET in .env file for production!');
}

const generateToken = (userId, role = 'user') => {
  if (!userId) {
    throw new Error('userId is required for token generation');
  }
  
  return jwt.sign(
    { 
      id: userId.toString(), 
      userId: userId.toString(), 
      role 
    }, 
    JWT_SECRET, 
    {
      expiresIn: '7d',
    }
  );
};

const verifyToken = (token) => {
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.error('Token expired:', error.message);
    } else if (error.name === 'JsonWebTokenError') {
      console.error('Token verification error:', error.message);
    } else {
      console.error('Token verification failed:', error.message);
    }
    return null;
  }
};

module.exports = { generateToken, verifyToken };
