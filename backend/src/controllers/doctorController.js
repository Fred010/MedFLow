import * as User from '../models/User.js';
import db from '../config/db.js';

// Get all doctors
export async function getAllDoctors(req, res) {
  try {
    const doctors = await User._getAllDoctors();

    res.json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve doctors. Please try again.'
    });
  }
}

// Get doctors by specialty
export async function getDoctorsBySpecialty(req, res) {
  try {
    const { specialty } = req.params;

    if (!specialty) {
      return res.status(400).json({
        success: false,
        message: 'Please specify a specialty to search.'
      });
    }

    const doctors = await User._getDoctorsBySpecialty(specialty);

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
      message: 'Failed to retrieve doctors. Please try again.'
    });
  }
}

// Get a single doctor’s details
export async function getDoctorById(req, res) {
  try {
    const { id } = req.params;
    const doctor = await User.findUserById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'That doctor could not be found.'
      });
    }

    if (doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'This user is not registered as a doctor.'
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
      message: 'Failed to retrieve doctor details. Please try again.'
    });
  }
}

// Get all available specialties
export async function getSpecialties(req, res) {
  try {
    const query = `
      SELECT DISTINCT specialty 
      FROM users 
      WHERE role = "doctor" 
        AND specialty IS NOT NULL 
      ORDER BY specialty
    `;
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
      message: 'Failed to load available specialties. Please try again.'
    });
  }
}
