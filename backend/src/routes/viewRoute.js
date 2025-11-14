// src/routes/viewRoutes.js
import express from 'express';
import * as ViewController from '../controllers/viewController.js';
import { authMiddleware, optionalAuth } from '../middlewares/authMiddleware.js';
import { isPatient, isDoctor } from '../middlewares/roleMiddleware.js';

const router = express.Router();

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

export default router;
