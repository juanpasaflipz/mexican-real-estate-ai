const passport = require('passport');

// Require authentication
const requireAuth = passport.authenticate('jwt', { session: false });

// Require specific role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
};

// Optional authentication (doesn't fail if not authenticated)
const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};

// Check if user owns the resource or is admin
const requireOwnershipOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Admins can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    try {
      const ownerId = await getResourceOwnerId(req);
      
      if (ownerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You do not own this resource.'
        });
      }

      next();
    } catch (error) {
      console.error('Error checking ownership:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify ownership'
      });
    }
  };
};

module.exports = {
  requireAuth,
  requireRole,
  optionalAuth,
  requireOwnershipOrAdmin
};