import express from 'express';
import { requireRole } from '../middlewares/roleMiddleware.js';
import {
    getAllDoctors,
    getDoctorsBySpecialty,
    getDoctorById,
    getSpecialties,
} from '../controllers/doctorController.js';

const router = express.Router();

// All routes in this router are for doctors
const doctorOnly = requireRole('doctor');

// Dashboard
router.get('/dashboard', doctorOnly, getAllDoctors);
router.get('/', doctorOnly, getAllDoctors);
router.get('/specialties', doctorOnly, getSpecialties);
router.get('/specialty/:specialty', doctorOnly, getDoctorsBySpecialty);
router.get('/:id', doctorOnly, getDoctorById);

export default router;
