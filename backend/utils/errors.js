//Custom error class for application errors
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

//error handler middleware (global)
export const errorHandler = (err, req, res, next) => {
  // Log all errors on the server side
  console.error(err);

  const isProd = process.env.NODE_ENV === 'production';
  const statusCode = err.statusCode && Number.isInteger(err.statusCode)
    ? err.statusCode
    : 500;

  const message =
    err instanceof AppError && err.message
      ? err.message
      : statusCode === 500
      ? 'Internal Server Error'
      : err.message || 'Error';

  const errorBody = {
    message,
  };

  if (err.errors) {
    errorBody.errors = err.errors;
  }

  if (!isProd) {
    errorBody.stack = err.stack;
  }

  res.status(statusCode).json({
    success: false,
    error: errorBody,
  });
};

//async handler wrapper to catch erros in async route handlers
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
