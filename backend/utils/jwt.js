const jwt = require('jsonwebtoken');

// Ensure JWT_SECRET is loaded from environment
let JWT_SECRET = process.env.JWT_SECRET || '46496b47f8fa05837a4b367bac06c32b2d4959f9e3271b23b7fe14f2d0c61311';

// Trim whitespace from JWT_SECRET
JWT_SECRET = JWT_SECRET.trim();

// Warn if using default secret
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: Using default JWT_SECRET. Set JWT_SECRET in .env file for production!');
}

// Log JWT_SECRET info for debugging (first 10 chars only for security)
console.log(`ℹ️ JWT_SECRET loaded: ${JWT_SECRET.substring(0, 10)}... (length: ${JWT_SECRET.length})`);

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
      console.error('❌ Token expired:', error.message);
    } else if (error.name === 'JsonWebTokenError') {
      console.error('❌ Token verification error:', error.message);
      console.error('   Error details:', {
        name: error.name,
        message: error.message,
        tokenLength: token?.length || 0,
        secretLength: JWT_SECRET.length,
      });
    } else {
      console.error('❌ Token verification failed:', error.message);
    }
    return null;
  }
};

module.exports = { generateToken, verifyToken };
