import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './user.js';

const router = express.Router();

// testing route only 
router.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'API is working!',
    version: '1.0.0'
  });
});

// Auth routes
router.use('/auth', authRoutes);

// User management routes (super_admin only)
router.use('/users', userRoutes);

export default router;
