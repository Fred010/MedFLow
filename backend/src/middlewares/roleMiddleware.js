// Helper for role checking
const checkRole = (req, res, next, roleName) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.user.role !== roleName) {
    return res.status(403).json({
      success: false,
      message: `Access denied. ${roleName.charAt(0).toUpperCase() + roleName.slice(1)}s only.`
    });
  }

  next();
};

// Generic middleware: allow multiple roles
export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Insufficient permissions.'
    });
  }

  next();
};

// Specific role middlewares using helper
export const isPatient = (req, res, next) => checkRole(req, res, next, 'patient');
export const isDoctor = (req, res, next) => checkRole(req, res, next, 'doctor');
export const isAdmin = (req, res, next) => checkRole(req, res, next, 'admin');
