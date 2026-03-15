import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload (user id, email, role)
 * @returns {string} - JWT token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - Token payload (user id)
 * @returns {string} - Refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * Verify JWT access token
 * @param {string} token - JWT token
 * @returns {Object} - Decoded token payload
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Verify JWT refresh token
 * @param {string} token - Refresh token
 * @returns {Object} - Decoded token payload
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};
