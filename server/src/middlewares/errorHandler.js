const mongoose = require('mongoose');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      message,
      statusCode: 404
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = {
      message,
      statusCode: 400
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(error => error.message)
      .join(', ');
    error = {
      message,
      statusCode: 400,
      errors: Object.keys(err.errors).reduce((acc, key) => {
        acc[key] = err.errors[key].message;
        return acc;
      }, {})
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token has expired',
      statusCode: 401
    };
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File size too large',
      statusCode: 400
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      message: 'Unexpected file field',
      statusCode: 400
    };
  }

  // Handle specific error types
  if (err.type === 'entity.parse.failed') {
    error = {
      message: 'Invalid JSON in request body',
      statusCode: 400
    };
  }

  // Handle timeout errors
  if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
    error = {
      message: 'Request timeout',
      statusCode: 408
    };
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Create error response
  const errorResponse = {
    success: false,
    message
  };

  // Add validation errors if present
  if (error.errors) {
    errorResponse.errors = error.errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.originalError = err;
  }

  // Add request information for debugging
  if (process.env.NODE_ENV === 'development') {
    errorResponse.request = {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      body: req.body,
      headers: req.headers,
      ip: req.ip
    };
  }

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler for undefined routes
const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

// Custom error class
class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'CustomError';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error creators
const createValidationError = (message, errors = {}) => {
  const error = new CustomError(message, 400);
  error.errors = errors;
  return error;
};

const createNotFoundError = (resource = 'Resource') => {
  return new CustomError(`${resource} not found`, 404);
};

const createUnauthorizedError = (message = 'Unauthorized') => {
  return new CustomError(message, 401);
};

const createForbiddenError = (message = 'Forbidden') => {
  return new CustomError(message, 403);
};

const createConflictError = (message = 'Resource already exists') => {
  return new CustomError(message, 409);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound,
  CustomError,
  createValidationError,
  createNotFoundError,
  createUnauthorizedError,
  createForbiddenError,
  createConflictError
};
