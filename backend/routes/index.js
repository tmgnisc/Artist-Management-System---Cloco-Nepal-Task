import express from 'express';

const router = express.Router();

// testing route only
router.get('/', (req, res) => {
  res.json({ message: 'API is working!' });
});

export default router;
