import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createConnection } from './config/database.js';
import routes from './routes/index.js';
import { errorHandler } from './utils/errors.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection and initialization
createConnection().catch((error) => {
  console.error('Failed to connect to database:', error);
  process.exit(1);
});

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  errorHandler(err, req, res, next);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
