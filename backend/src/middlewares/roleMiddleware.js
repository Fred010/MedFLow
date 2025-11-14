// Generic role checker for multiple allowed roles
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
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
};

// Specific role check — Patient
export const isPatient = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.user.role !== 'patient') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Patients only.'
    });
  }

  next();
};

// Specific role check — Doctor
export const isDoctor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.user.role !== 'doctor') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Doctors only.'
    });
  }

  next();
};

// Specific role check — Admin
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admins only.'
    });
  }

  next();
};
