import express from 'express'
import {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
} from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'
import {
  validateRegister,
  validateLogin,
  validateRefreshToken,
} from '../middleware/validation.js'

const router = express.Router()

// Public routes
router.post('/register', validateRegister, register)
router.post('/login', validateLogin, login)
router.post('/refresh-token', validateRefreshToken, refreshToken)

// Protected routes (require authentication)
router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, updateProfile)
router.put('/change-password', authenticate, changePassword)

export default router
