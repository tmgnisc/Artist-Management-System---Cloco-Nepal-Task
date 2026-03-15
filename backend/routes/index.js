import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './user.js';
import artistRoutes from './artist.js';
import songRoutes from './song.js';

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

// Artist management routes (super_admin, artist)
router.use('/artists', artistRoutes);

// Song admin routes (super_admin, artist_manager)
router.use('/songs', songRoutes);

export default router;
