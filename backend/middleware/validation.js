import { body, validationResult, query } from 'express-validator'
import { AppError } from '../utils/errors.js'

/**
 * Middleware to check validation results
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }))
    const error = new AppError('Validation failed', 400)
    error.errors = errorMessages
    return next(error)
  }
  next()
}

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
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),

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
]

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

  body('password').notEmpty().withMessage('Password is required'),

  validate,
]

/**
 * Validation rules for refresh token
 */
export const validateRefreshToken = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),

  validate,
]

/**
 * Validation rules for creating user (admin)
 */
export const validateCreateUser = [
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
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),

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
]

/**
 * Validation rules for updating user (admin)
 */
export const validateUpdateUser = [
  body('first_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ min: 2, max: 255 })
    .withMessage('First name must be between 2 and 255 characters'),

  body('last_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ min: 2, max: 255 })
    .withMessage('Last name must be between 2 and 255 characters'),

  body('email')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Email cannot be empty')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),

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
    .optional()
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
]

//validation rules for creating a song
export const validateCreateSong = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),

  body('album_name')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Album name must not exceed 255 characters'),

  body('genre')
    .notEmpty()
    .withMessage('Genre is required')
    .isIn(['rnb', 'country', 'classic', 'rock', 'jazz'])
    .withMessage('Genre must be one of: rnb, country, classic, rock, jazz'),

  validate,
]

//validation rules for updating a song
export const validateUpdateSong = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),

  body('album_name')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Album name must not exceed 255 characters'),

  body('genre')
    .optional()
    .isIn(['rnb', 'country', 'classic', 'rock', 'jazz'])
    .withMessage('Genre must be one of: rnb, country, classic, rock, jazz'),

  validate,
]

//validation rules for listing songs (admin view)
export const validateListSongs = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('genre')
    .optional()
    .isIn(['rnb', 'country', 'classic', 'rock', 'jazz'])
    .withMessage('Genre must be one of: rnb, country, classic, rock, jazz'),

  query('artistId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('artistId must be a positive integer'),

  query('title')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Title filter must not exceed 255 characters'),

  validate,
]

//validation rules for creating an artist
export const validateCreateArtist = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 255 })
    .withMessage('Name must not exceed 255 characters'),

  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date (YYYY-MM-DD)'),

  body('gender')
    .optional()
    .isIn(['m', 'f', 'o'])
    .withMessage('Gender must be one of: m, f, o'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Address must not exceed 1000 characters'),

  body('first_release_year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('First release year must be a valid year'),

  body('no_of_albums_released')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Number of albums released must be a non-negative integer'),

  validate,
]

//validation rules for updating an artist
export const validateUpdateArtist = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Name must not exceed 255 characters'),

  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date (YYYY-MM-DD)'),

  body('gender')
    .optional()
    .isIn(['m', 'f', 'o'])
    .withMessage('Gender must be one of: m, f, o'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Address must not exceed 1000 characters'),

  body('first_release_year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('First release year must be a valid year'),

  body('no_of_albums_released')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Number of albums released must be a non-negative integer'),

  validate,
]
