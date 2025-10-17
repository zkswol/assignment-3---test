const User = require('../models/user');

const authenticateUser = async (req, res, next) => {
  try {
    // Check for userId in query params, body, or headers
    const userId = req.query.userId || req.body.userId || req.headers['user-id'];
    
    if (!userId) {
      return res.status(401).json({ 
        ok: false, 
        error: 'User ID is required' 
      });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ 
        ok: false, 
        error: 'User not found' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'Authentication failed' 
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        ok: false, 
        error: 'User not authenticated' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        ok: false, 
        error: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

const requireChef = requireRole(['chef']);
const requireAdmin = requireRole(['admin']);
const requireManager = requireRole(['manager', 'admin']);

module.exports = {
  authenticateUser,
  requireRole,
  requireChef,
  requireAdmin,
  requireManager
};
