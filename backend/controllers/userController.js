import { query } from '../config/database.js'
import { hashPassword } from '../utils/password.js'
import { AppError } from '../utils/errors.js'
import { asyncHandler } from '../utils/errors.js'
import { sendSuccess } from '../utils/response.js'

//list users with pagination
export const listUsers = asyncHandler(async (req, res) => {
  let page = parseInt(req.query.page) || 1
  let limit = parseInt(req.query.limit) || 10
  const search = req.query.search || ''
  const role = req.query.role || ''

  // Validate pagination parameters
  if (page < 1) page = 1
  if (limit < 1) limit = 1
  if (limit > 100) limit = 100 // Max limit to prevent abuse

  // Validate role if provided
  if (role && !['super_admin', 'artist_manager', 'artist'].includes(role)) {
    throw new AppError(
      'Invalid role filter. Must be one of: super_admin, artist_manager, artist',
      400,
    )
  }

  const offset = (page - 1) * limit

  // Build WHERE clause
  let whereClause = '1=1'
  const queryParams = []

  if (search) {
    whereClause += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`
    const searchPattern = `%${search}%`
    queryParams.push(searchPattern, searchPattern, searchPattern)
  }

  if (role) {
    whereClause += ` AND role = ?`
    queryParams.push(role)
  }

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total FROM users WHERE ${whereClause}`,
    queryParams,
  )
  const total = countResult[0].total

  // Get users with pagination
  const users = await query(
    `SELECT id, first_name, last_name, email, phone, dob, gender, address, role, created_at, updated_at
     FROM users 
     WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...queryParams, limit, offset],
  )

  const totalPages = Math.ceil(total / limit)

  sendSuccess(
    res,
    {
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
    'Users retrieved successfully',
  )
})

//create user (super_admin only)
export const createUser = asyncHandler(async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    phone,
    dob,
    gender,
    address,
    role = 'artist',
  } = req.body

  // Check if user already exists
  const existingUsers = await query('SELECT id FROM users WHERE email = ?', [
    email,
  ])

  if (existingUsers.length > 0) {
    throw new AppError('User with this email already exists', 409)
  }

  // Validate role
  const validRoles = ['super_admin', 'artist_manager', 'artist']
  if (!validRoles.includes(role)) {
    throw new AppError(
      'Invalid role. Must be one of: super_admin, artist_manager, artist',
      400,
    )
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Insert user into database
  const result = await query(
    `INSERT INTO users (first_name, last_name, email, password, phone, dob, gender, address, role)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      first_name,
      last_name,
      email,
      hashedPassword,
      phone || null,
      dob || null,
      gender,
      address || null,
      role,
    ],
  )

  const userId = result.insertId

  // Get the created user (without password)
  const users = await query(
    `SELECT id, first_name, last_name, email, phone, dob, gender, address, role, created_at, updated_at
     FROM users WHERE id = ?`,
    [userId],
  )

  sendSuccess(res, { user: users[0] }, 'User created successfully', 201)
})

//get user by id
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const users = await query(
    `SELECT id, first_name, last_name, email, phone, dob, gender, address, role, created_at, updated_at
     FROM users WHERE id = ?`,
    [id],
  )

  if (users.length === 0) {
    throw new AppError('User not found', 404)
  }

  sendSuccess(res, { user: users[0] }, 'User retrieved successfully')
})

//update user
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params
  const {
    first_name,
    last_name,
    email,
    password,
    phone,
    dob,
    gender,
    address,
    role,
  } = req.body

  // Check if user exists
  const existingUsers = await query(
    'SELECT id, email FROM users WHERE id = ?',
    [id],
  )

  if (existingUsers.length === 0) {
    throw new AppError('User not found', 404)
  }

  const existingUser = existingUsers[0]

  // Check if email is being changed and if new email already exists
  if (email && email !== existingUser.email) {
    const emailCheck = await query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, id],
    )
    if (emailCheck.length > 0) {
      throw new AppError('Email already exists', 409)
    }
  }

  // Validate role if provided
  if (role) {
    const validRoles = ['super_admin', 'artist_manager', 'artist']
    if (!validRoles.includes(role)) {
      throw new AppError(
        'Invalid role. Must be one of: super_admin, artist_manager, artist',
        400,
      )
    }
  }

  // Build update query dynamically
  const updates = []
  const values = []

  if (first_name !== undefined) {
    updates.push('first_name = ?')
    values.push(first_name)
  }
  if (last_name !== undefined) {
    updates.push('last_name = ?')
    values.push(last_name)
  }
  if (email !== undefined) {
    updates.push('email = ?')
    values.push(email)
  }
  if (phone !== undefined) {
    updates.push('phone = ?')
    values.push(phone)
  }
  if (dob !== undefined) {
    updates.push('dob = ?')
    values.push(dob)
  }
  if (gender !== undefined) {
    updates.push('gender = ?')
    values.push(gender)
  }
  if (address !== undefined) {
    updates.push('address = ?')
    values.push(address)
  }
  if (role !== undefined) {
    updates.push('role = ?')
    values.push(role)
  }
  if (password !== undefined) {
    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400)
    }
    const hashedPassword = await hashPassword(password)
    updates.push('password = ?')
    values.push(hashedPassword)
  }

  if (updates.length === 0) {
    throw new AppError('No fields to update', 400)
  }

  values.push(id)

  await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values)

  // Get updated user
  const users = await query(
    `SELECT id, first_name, last_name, email, phone, dob, gender, address, role, created_at, updated_at
     FROM users WHERE id = ?`,
    [id],
  )

  sendSuccess(res, { user: users[0] }, 'User updated successfully')
})

//delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Check if user exists
  const users = await query('SELECT id, email, role FROM users WHERE id = ?', [
    id,
  ])

  if (users.length === 0) {
    throw new AppError('User not found', 404)
  }

  const user = users[0]

  // Prevent deleting yourself
  if (parseInt(id) === parseInt(req.userId)) {
    throw new AppError('You cannot delete your own account', 400)
  }

  // Prevent deleting other super_admin (optional safety check)
  if (user.role === 'super_admin' && user.id !== req.userId) {
    throw new AppError('Cannot delete another super admin', 403)
  }

  // Delete user
  await query('DELETE FROM users WHERE id = ?', [id])

  sendSuccess(res, null, 'User deleted successfully')
})
