/**
 * Send success response
 */
export const sendSuccess = (
  res,
  data,
  message = 'Success',
  statusCode = 200,
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

/**
 * Send error response
 */
export const sendError = (res, message = 'Error', statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    error: {
      message,
    },
  })
}
