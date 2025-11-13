// src/routes/viewRoutes.js
import express from 'express';
import { 
  home, 
  loginPage, 
  registerPage, 
  patientDashboard,
  doctorsPage,
  bookAppointmentPage,
  doctorDashboard,
  appointmentDetails
} from '../controllers/viewController.js';

import { authMiddleware, optionalAuth } from '../middlewares/authMiddleware.js';
import { isPatient, isDoctor } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, home);
router.get('/login', optionalAuth, loginPage);
router.get('/register', optionalAuth, registerPage);

// Patient routes
router.get('/patient/dashboard', authMiddleware, isPatient, patientDashboard);
router.get('/doctors', authMiddleware, isPatient, doctorsPage);
router.get('/book-appointment/:doctorId', authMiddleware, isPatient, bookAppointmentPage);

// Doctor routes
router.get('/doctor/dashboard', authMiddleware, isDoctor, doctorDashboard);

// Shared route for viewing appointment details
router.get('/appointment/:id', authMiddleware, appointmentDetails);

export default router;
