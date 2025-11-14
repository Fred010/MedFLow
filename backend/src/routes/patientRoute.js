import express from 'express';
import { requireRole } from '../middlewares/roleMiddleware.js'; // <-- fixed path
import {
    getDashboard,
    getProfile,
    updateProfile,
    getDoctors,
    getAppointments,
    getMedicalHistory
} from '../controllers/patientController.js';

const router = express.Router();

// Middleware to allow only patients
const patientOnly = requireRole('patient');

// Dashboard
router.get('/dashboard', patientOnly, getDashboard);

// Profile
router.get('/profile', patientOnly, getProfile);
router.post('/profile', patientOnly, updateProfile);

// Doctors
router.get('/doctors', patientOnly, (req, res, next) => {
    console.log('GET /patient/doctors hit by user:', req.user);
    next();
}, getDoctors);

// Appointments
router.get('/appointments', patientOnly, getAppointments);

// Medical History
router.get('/medical-history', patientOnly, getMedicalHistory);

export default router;
