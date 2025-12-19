const jwt = require('jsonwebtoken');

const generateToken = (userId, role = 'user') => {
  return jwt.sign(
    { 
      id: userId.toString(), 
      userId: userId.toString(), 
      role 
    }, 
    process.env.JWT_SECRET || 'your-secret-key', 
    {
      expiresIn: '7d',
    }
  );
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
};

module.exports = { generateToken, verifyToken };
