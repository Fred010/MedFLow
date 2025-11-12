// src/routes/appointmentRoutes.js

import express from "express";
// Import individual functions using named imports { ... }
import { 
    createAppointment,
    getPatientAppointments,
    cancelAppointment,
    getDoctorAppointments,
    getPendingAppointments,
    approveAppointment,
    declineAppointment,
    getAppointment
} from "../controllers/appointmentController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isPatient, isDoctor } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Patient routes
// Reference the imported functions directly
router.post('/', isPatient, createAppointment);
router.get('/my-appointments', isPatient, getPatientAppointments);
router.delete('/:id', isPatient, cancelAppointment);

// Doctor routes
router.get('/doctor/appointments', isDoctor, getDoctorAppointments);
router.get('/doctor/pending', isDoctor, getPendingAppointments);
// Note: getDoctorStats was likely missed in your previous code snippet, 
// make sure it's exported from the controller if needed.
// router.get('/doctor/stats', isDoctor, getDoctorStats); 
router.patch('/:id/approve', isDoctor, approveAppointment);
router.patch('/:id/decline', isDoctor, declineAppointment);

// Common routes (both patient and doctor)
router.get('/:id', getAppointment);

export default router;
