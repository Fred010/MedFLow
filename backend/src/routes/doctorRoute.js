import express from 'express';
import { optionalAuth, authMiddleware } from '../middlewares/authMiddleware.js';
import { getAllDoctors, getDoctorsBySpecialty, getDoctorById, getSpecialties } from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', optionalAuth, authMiddleware, getAllDoctors);
router.get('/specialties', optionalAuth, getSpecialties);
router.get('/specialty/:specialty', optionalAuth, getDoctorsBySpecialty);
router.get('/:id', optionalAuth, authMiddleware, getDoctorById);

export default router;
