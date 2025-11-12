// src/routes/doctorRoutes.js
import Router from 'express';
import DoctorController from '../controllers/doctorController.js';
import optionalAuth from '../middlewares/authMiddleware.js';

const router = Router();

// Public routes (patients can view doctors without login)
router.get('/', optionalAuth, DoctorController.getAllDoctors);
router.get('/specialties', optionalAuth, DoctorController.getSpecialties);
router.get('/specialty/:specialty', optionalAuth, DoctorController.getDoctorsBySpecialty);
router.get('/:id', optionalAuth, DoctorController.getDoctorById);

export default router;