import express from 'express';
import * as AuthController from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes
router.post('/logout', authMiddleware, AuthController.logout);
router.get('/me', authMiddleware, AuthController.getCurrentUser);
router.get('/verify', authMiddleware, AuthController.verifyToken);

export default router;