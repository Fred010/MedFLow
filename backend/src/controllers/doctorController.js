import * as User from '../models/User.js';
import db from '../config/db.js';

// Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.getAllDoctors();

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
};

// Get doctors by specialty
export const getDoctorsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.params;

    if (!specialty) {
      return res.status(400).json({
        success: false,
        message: 'Specialty is required.'
      });
    }

    const doctors = await User.getDoctorsBySpecialty(specialty);

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
};

// Get single doctor details
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await User.findById(id);

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
};

// Get available specialties
export const getSpecialties = async (req, res) => {
  try {
    const query = 'SELECT DISTINCT specialty FROM users WHERE role = "doctor" AND specialty IS NOT NULL ORDER BY specialty';
    const [specialties] = await db.query(query);

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
};
