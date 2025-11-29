/**
 * Error Handling Middleware
 * Centralized error handling for the Express application
 */

/**
 * 404 Not Found Error Handler
 * Catches requests to undefined routes and passes to error handler
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function NotFoundError(req, res, next) {
  const err = new Error("Not found");
  err.status = 404;
  next(err);
}

/**
 * Empty Response Handler
 * Checks if data exists in res.locals, returns 404 if not
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function handleEmptyResponse(req, res, next) {
  if (!res.locals.data) {
    res.status(404).json({
      success: false,
      message: "Data not found"
    });
  } else {
    next();
  }
}

/**
 * Global Error Handler
 * Catches all errors passed via next(err) and returns formatted JSON response
 *
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function errorHandler(err, req, res, next) {
  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
