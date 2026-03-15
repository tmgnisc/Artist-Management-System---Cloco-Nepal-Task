import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/errors.js';
import { query } from '../config/database.js';

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided. Authorization header must be in format: Bearer <token>', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new AppError('No token provided', 401);
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Token has expired', 401);
      } else if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid token', 401);
      }
      throw new AppError('Token verification failed', 401);
    }

    // Get user from database to ensure they still exist
    const users = await query(
      'SELECT id, email, role, first_name, last_name FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      throw new AppError('User not found', 401);
    }

    // Attach user to request object
    req.user = users[0];
    req.userId = decoded.userId;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has required role(s)
 * @param {...string} roles - Roles allowed to access the route
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`,
          403
        )
      );
    }

    next();
  };
};
