import { body, validationResult } from 'express-validator';
import { AppError } from '../utils/errors.js';

/**
 * Middleware to check validation results
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    const error = new AppError('Validation failed', 400);
    error.errors = errorMessages;
    return next(error);
  }
  next();
};

/**
 * Validation rules for user registration
 */
export const validateRegister = [
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('First name must be between 2 and 255 characters'),
  
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Last name must be between 2 and 255 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date (YYYY-MM-DD)'),
  
  body('gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['m', 'f', 'o'])
    .withMessage('Gender must be one of: m, f, o'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Address must not exceed 1000 characters'),
  
  body('role')
    .optional()
    .isIn(['super_admin', 'artist_manager', 'artist'])
    .withMessage('Role must be one of: super_admin, artist_manager, artist'),
  
  validate,
];

/**
 * Validation rules for user login
 */
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validate,
];

/**
 * Validation rules for refresh token
 */
export const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
  
  validate,
];
