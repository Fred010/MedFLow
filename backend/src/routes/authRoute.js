import express from "express";
import { register, login, logout, verifyToken, getCurrentUser } from "../controllers/authController.js";
import { authMiddleware, optionalAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.post("/logout", authMiddleware, logout);
router.get("/verify", authMiddleware, verifyToken);
router.get("/me", authMiddleware, getCurrentUser);

// Optional authentication route
router.get("/optional", optionalAuth, (req, res) => {
  res.json({ success: true, user: req.user || null });
});

export default router;
