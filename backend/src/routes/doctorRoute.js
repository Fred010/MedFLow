//doctorRoutes.js
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

// Doctor dashboard (only doctors should access)
router.get('/dashboard', doctorOnly, getAllDoctors);

// Public routes (patients + doctors)
router.get('/', getAllDoctors);                       // List all doctors
router.get('/specialties', getSpecialties);           // Get all specialties
router.get('/specialty/:specialty', getDoctorsBySpecialty);  // Filter by specialty
router.get('/:id', getDoctorById);  

export default router;