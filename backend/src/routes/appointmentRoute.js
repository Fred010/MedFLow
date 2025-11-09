// src/routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/appointmentController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { isPatient, isDoctor } = require('../middleware/roleMiddleware');

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

module.exports = router;