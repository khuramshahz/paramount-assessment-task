// Centralized error handler
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(500).json({
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_ERROR'
    }
  });
};
export default errorHandler;
