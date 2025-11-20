// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { findUserById } from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from cookie or Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.token ||
      (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Validate token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load user from database
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Attach sanitized user object
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialty: user.specialty || null
    };

    next();

  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error.'
    });
  }
};

// Optional auth (safe for pages that do not require login)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.token ||
      (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await findUserById(decoded.id);

      if (user) {
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          specialty: user.specialty || null
        };
      }
    }
  } catch (err) {
    req.user = null; // silently fail but do NOT throw error
  }

  next();
};
