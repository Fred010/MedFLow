import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as User from '../models/User.js';
import * as emailService from '../services/emailService.js';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password, role, specialty } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide all required fields." });
    }

    const existingUser = await User.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered." });
    }

    const validRoles = ["patient", "doctor"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role." });
    }

    if (role === "doctor" && !specialty) {
      return res.status(400).json({ success: false, message: "Specialty required for doctors." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserId = await User.createUser({
      name,
      email,
      password: hashedPassword,
      role: role || "patient",
      specialty: role === "doctor" ? specialty : null
    });

    const newUser = await User.findUserById(newUserId);

    // Send welcome email
    await emailService.sendEmail(
      newUser.email,
      emailService.EMAIL_SUBJECTS.WELCOME,
      `<h2>Welcome, ${newUser.name}!</h2><p>Your MedFlow account is ready.</p>`
    );

    const token = generateToken(newUser);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        specialty: newUser.specialty
      },
      token
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Failed to create your account. Please try again." });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    const user = await User.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Login successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialty: user.specialty || null
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log you in. Please try again.'
    });
  }
};

// Logout user
export const logout = (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.json({
      success: true,
      message: 'Logout successful.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log you out. Please try again.'
    });
  }
};

// Get current authenticated user
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'You are not logged in.'
      });
    }

    const user = await User.findUserById(req.user.id);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialty: user.specialty || null
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your account details.'
    });
  }
};

// Verify JWT token
export const verifyToken = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'You are not logged in.'
      });
    }

    res.json({
      success: true,
      message: 'Your session is active.',
      user: req.user
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify your session. Please try again.'
    });
  }
};
