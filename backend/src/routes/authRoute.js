import { register, login, logout, verifyToken } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

import Router from "express";
const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/logout', authMiddleware, logout);
router.get('/verify', authMiddleware, verifyToken);

export default router;
