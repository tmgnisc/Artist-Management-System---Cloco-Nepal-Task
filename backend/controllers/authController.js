import { query } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../utils/errors.js';
import { asyncHandler } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';

//register a new user
export const register = asyncHandler(async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    phone,
    dob,
    gender,
    address,
    role = 'artist', // Default role
  } = req.body;

  // Check if user already exists
  const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email]);
  
  if (existingUsers.length > 0) {
    throw new AppError('User with this email already exists', 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Insert user into database
  const result = await query(
    `INSERT INTO users (first_name, last_name, email, password, phone, dob, gender, address, role)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, email, hashedPassword, phone || null, dob || null, gender, address || null, role]
  );

  const userId = result.insertId;

  // Get the created user (without password)
  const users = await query(
    `SELECT id, first_name, last_name, email, phone, dob, gender, address, role, created_at
     FROM users WHERE id = ?`,
    [userId]
  );

  const user = users[0];

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  sendSuccess(
    res,
    {
      user,
      accessToken,
      refreshToken,
    },
    'User registered successfully',
    201
  );
});


//login a user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const users = await query(
    `SELECT id, first_name, last_name, email, password, phone, dob, gender, address, role, created_at
     FROM users WHERE email = ?`,
    [email]
  );

  if (users.length === 0) {
    throw new AppError('Invalid email or password', 401);
  }

  const user = users[0];

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Remove password from user object
  delete user.password;

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  sendSuccess(
    res,
    {
      user,
      accessToken,
      refreshToken,
    },
    'Login successful'
  );
});

//refresh access token
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new AppError('Refresh token is required', 400);
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Refresh token has expired', 401);
    } else if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid refresh token', 401);
    }
    throw new AppError('Token verification failed', 401);
  }

  // Verify user still exists
  const users = await query(
    'SELECT id, email, role FROM users WHERE id = ?',
    [decoded.userId]
  );

  if (users.length === 0) {
    throw new AppError('User not found', 401);
  }

  const user = users[0];

  // Generate new access token
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  sendSuccess(
    res,
    {
      accessToken,
    },
    'Token refreshed successfully'
  );
});

//get current user profile
export const getProfile = asyncHandler(async (req, res) => {
  // User is attached to req by authenticate middleware
  const users = await query(
    `SELECT id, first_name, last_name, email, phone, dob, gender, address, role, created_at, updated_at
     FROM users WHERE id = ?`,
    [req.userId]
  );

  if (users.length === 0) {
    throw new AppError('User not found', 404);
  }

  sendSuccess(res, { user: users[0] }, 'Profile retrieved successfully');
});


//update userprofile
export const updateProfile = asyncHandler(async (req, res) => {
  const {
    first_name,
    last_name,
    phone,
    dob,
    gender,
    address,
  } = req.body;

  // Build update query dynamically
  const updates = [];
  const values = [];

  if (first_name !== undefined) {
    updates.push('first_name = ?');
    values.push(first_name);
  }
  if (last_name !== undefined) {
    updates.push('last_name = ?');
    values.push(last_name);
  }
  if (phone !== undefined) {
    updates.push('phone = ?');
    values.push(phone);
  }
  if (dob !== undefined) {
    updates.push('dob = ?');
    values.push(dob);
  }
  if (gender !== undefined) {
    updates.push('gender = ?');
    values.push(gender);
  }
  if (address !== undefined) {
    updates.push('address = ?');
    values.push(address);
  }

  if (updates.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  values.push(req.userId);

  await query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  // Get updated user
  const users = await query(
    `SELECT id, first_name, last_name, email, phone, dob, gender, address, role, created_at, updated_at
     FROM users WHERE id = ?`,
    [req.userId]
  );

  sendSuccess(res, { user: users[0] }, 'Profile updated successfully');
});


//change password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  if (newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters long', 400);
  }

  // Get user with password
  const users = await query(
    'SELECT id, password FROM users WHERE id = ?',
    [req.userId]
  );

  if (users.length === 0) {
    throw new AppError('User not found', 404);
  }

  const user = users[0];

  // Verify current password
  const isPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.userId]);

  sendSuccess(res, null, 'Password changed successfully');
});
