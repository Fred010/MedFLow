// src/routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const DoctorController = require('../controllers/doctorController');
const { optionalAuth } = require('../middleware/authMiddleware');

// Public routes (patients can view doctors without login)
router.get('/', optionalAuth, DoctorController.getAllDoctors);
router.get('/specialties', optionalAuth, DoctorController.getSpecialties);
router.get('/specialty/:specialty', optionalAuth, DoctorController.getDoctorsBySpecialty);
router.get('/:id', optionalAuth, DoctorController.getDoctorById);

module.exports = router;