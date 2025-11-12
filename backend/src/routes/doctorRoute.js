// src/routes/doctorRoutes.js
import Router from 'express';
import { getAllDoctors, getDoctorsBySpecialty, getDoctorById, getSpecialties } from '../controllers/doctorController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// Public routes (patients can view doctors without login)
router.get('/', optionalAuth, getAllDoctors);
router.get('/specialties', optionalAuth, getSpecialties);
router.get('/specialty/:specialty', optionalAuth, getDoctorsBySpecialty);
router.get('/:id', optionalAuth, getDoctorById);

export default router;