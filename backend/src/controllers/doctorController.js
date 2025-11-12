// src/controllers/doctorController.js
import { getAllDoctors as _getAllDoctors, getDoctorsBySpecialty as _getDoctorsBySpecialty, findById } from '../models/User.js';

class DoctorController {
  // Get all doctors
  static async getAllDoctors(req, res) {
    try {
      const doctors = await _getAllDoctors();

      res.json({
        success: true,
        count: doctors.length,
        doctors
      });
    } catch (error) {
      console.error('Get all doctors error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve doctors.'
      });
    }
  }

  // Get doctors by specialty
  static async getDoctorsBySpecialty(req, res) {
    try {
      const { specialty } = req.params;

      if (!specialty) {
        return res.status(400).json({
          success: false,
          message: 'Specialty is required.'
        });
      }

      const doctors = await _getDoctorsBySpecialty(specialty);

      res.json({
        success: true,
        count: doctors.length,
        specialty,
        doctors
      });
    } catch (error) {
      console.error('Get doctors by specialty error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve doctors.'
      });
    }
  }

  // Get single doctor details
  static async getDoctorById(req, res) {
    try {
      const { id } = req.params;
      const doctor = await findById(id);

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found.'
        });
      }

      if (doctor.role !== 'doctor') {
        return res.status(404).json({
          success: false,
          message: 'User is not a doctor.'
        });
      }

      res.json({
        success: true,
        doctor: {
          id: doctor.id,
          name: doctor.name,
          email: doctor.email,
          specialty: doctor.specialty,
          created_at: doctor.created_at
        }
      });
    } catch (error) {
      console.error('Get doctor by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve doctor information.'
      });
    }
  }

  // Get available specialties
  static async getSpecialties(req, res) {
    try {
      const query = 'SELECT DISTINCT specialty FROM users WHERE role = "doctor" AND specialty IS NOT NULL ORDER BY specialty';
      const db = require('../config/db').default;
      const [specialties] = await db.promise().query(query);

      res.json({
        success: true,
        count: specialties.length,
        specialties: specialties.map(s => s.specialty)
      });
    } catch (error) {
      console.error('Get specialties error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve specialties.'
      });
    }
  }
}

export default DoctorController;