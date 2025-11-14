// src/routes/appointmentRoutes.js
import express from 'express';
import * as AppointmentController from '../controllers/appointmentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { isPatient, isDoctor } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Patient routes
router.post('/', isPatient, AppointmentController.createAppointment);
router.get('/my-appointments', isPatient, AppointmentController.getPatientAppointments);
router.delete('/:id', isPatient, AppointmentController.cancelAppointment);

// Doctor routes
router.get('/doctor/appointments', isDoctor, AppointmentController.getDoctorAppointments);
router.get('/doctor/pending', isDoctor, AppointmentController.getPendingAppointments);
router.get('/doctor/stats', isDoctor, AppointmentController.getDoctorStats);
router.patch('/:id/approve', isDoctor, AppointmentController.approveAppointment);
router.patch('/:id/decline', isDoctor, AppointmentController.declineAppointment);

// Common routes (both patient and doctor)
router.get('/:id', AppointmentController.getAppointment);

export default router;
