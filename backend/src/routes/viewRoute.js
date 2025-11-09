// src/routes/viewRoutes.js
const express = require('express');
const router = express.Router();
const ViewController = require('../controllers/viewController');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const { isPatient, isDoctor } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', optionalAuth, ViewController.home);
router.get('/login', optionalAuth, ViewController.loginPage);
router.get('/register', optionalAuth, ViewController.registerPage);

// Patient routes
router.get('/patient/dashboard', authMiddleware, isPatient, ViewController.patientDashboard);
router.get('/doctors', authMiddleware, isPatient, ViewController.doctorsPage);
router.get('/book-appointment/:doctorId', authMiddleware, isPatient, ViewController.bookAppointmentPage);

// Doctor routes
router.get('/doctor/dashboard', authMiddleware, isDoctor, ViewController.doctorDashboard);

// Common routes
router.get('/appointment/:id', authMiddleware, ViewController.appointmentDetails);

module.exports = router;