const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ 
      ok: false, 
      error: errors.join(', ') 
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ 
      ok: false, 
      error: `${field} already exists` 
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      ok: false, 
      error: 'Invalid token' 
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      ok: false, 
      error: 'Token expired' 
    });
  }

  // Default error
  res.status(err.status || 500).json({
    ok: false,
    error: err.message || 'Internal server error'
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Route not found'
  });
};

module.exports = {
  errorHandler,
  notFound
};
