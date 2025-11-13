import jwt from 'jsonwebtoken';
import * as User from '../models/User.js';

// Helper: Extract token from cookies or Authorization header
const getTokenFromRequest = (req) => {
  if (req.cookies?.token) return req.cookies.token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

// Strict authentication middleware
export const authMiddleware = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in to continue.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB
    const user = await User.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.'
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialty: user.specialty || null
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed. Please try again.'
    });
  }
};

// Optional authentication middleware
export const optionalAuth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findUserById(decoded.id);

      if (user) {
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          specialty: user.specialty || null
        };
      } else {
        req.user = null;
      }
    } else {
      req.user = null;
    }
  } catch (error) {
    req.user = null;
  }

  next();
};
