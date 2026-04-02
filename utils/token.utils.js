const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for user
 * @param {string} userId - User ID to include in token
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Generate reset password token (short-lived)
 * @param {string} userId - User ID
 * @returns {string} JWT token for password reset
 */
const generateResetToken = (userId) => {
  return jwt.sign({ id: userId, purpose: 'reset' }, process.env.JWT_SECRET, {
    expiresIn: '1h', // Reset token expires in 1 hour
  });
};

/**
 * Verify reset password token
 * @param {string} token - Reset token to verify
 * @returns {object|null} Decoded token payload or null if invalid
 */
const verifyResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== 'reset') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  generateResetToken,
  verifyResetToken,
};