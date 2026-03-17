import express from 'express'
import {
  listUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import {
  validateCreateUser,
  validateUpdateUser,
} from '../middleware/validation.js'

const router = express.Router()

// All user management routes require super_admin role
router.use(authenticate, authorize('super_admin'))

// User management routes
router.get('/', listUsers)
router.post('/', validateCreateUser, createUser)
router.get('/:id', getUserById)
router.put('/:id', validateUpdateUser, updateUser)
router.delete('/:id', deleteUser)

export default router
