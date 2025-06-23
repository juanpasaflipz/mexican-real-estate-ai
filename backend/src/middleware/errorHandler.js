const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  // Default error
  let status = err.status || 500
  let message = err.message || 'Internal Server Error'
  let details = undefined

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '42P01':
        status = 400
        message = 'Table does not exist'
        break
      case '42703':
        status = 400
        message = 'Column does not exist'
        break
      case '42601':
        status = 400
        message = 'SQL syntax error'
        break
      case '23505':
        status = 409
        message = 'Duplicate key violation'
        break
      case '23503':
        status = 400
        message = 'Foreign key violation'
        break
      case '22P02':
        status = 400
        message = 'Invalid text representation'
        break
      default:
        message = `Database error: ${err.code}`
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    status = 400
    message = 'Validation error'
    details = err.errors
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    status = 401
    message = 'Invalid token'
  }

  if (err.name === 'TokenExpiredError') {
    status = 401
    message = 'Token expired'
  }

  // Send error response
  res.status(status).json({
    error: {
      message,
      status,
      details: process.env.NODE_ENV === 'development' ? details || err.stack : undefined,
      timestamp: new Date().toISOString()
    }
  })
}

module.exports = { errorHandler }