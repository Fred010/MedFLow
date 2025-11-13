
import * as User from '../models/User.js';
import {
  getPatientAppointments,
  getDoctorAppointments,
  getPendingAppointments,
  getDoctorStats,
  findAppointmentById
} from '../models/Appointments.js';
import db from '../config/db.js';

// Home page
export const home = async (req, res) => {
  try {
    res.render('index', {
      title: 'Welcome to MedFlow',
      user: req.user || null
    });
  } catch (error) {
    console.error('Home page error:', error);
    res.status(500).render('error', { message: 'Server error', error });
  }
};

// Login page
export const loginPage = async (req, res) => {
  try {
    if (req.user) {
      return res.redirect(req.user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    }

    res.render('login', {
      title: 'Login - MedFlow',
      user: null
    });
  } catch (error) {
    console.error('Login page error:', error);
    res.status(500).render('error', { message: 'Server error', error });
  }
};

// Register page
export const registerPage = async (req, res) => {
  try {
    if (req.user) {
      return res.redirect(req.user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    }

    res.render('register', {
      title: 'Register - MedFlow',
      user: null
    });
  } catch (error) {
    console.error('Register page error:', error);
    res.status(500).render('error', { message: 'Server error', error });
  }
};

// Patient dashboard
export const patientDashboard = async (req, res) => {
  try {
    const appointments = await getPatientAppointments(req.user.id);

    res.render('patient/dashboard', {
      title: 'My Dashboard - MedFlow',
      user: req.user,
      appointments
    });
  } catch (error) {
    console.error('Patient dashboard error:', error);
    res.status(500).render('error', { message: 'Server error', error });
  }
};

// Doctors listing page
export const doctorsPage = async (req, res) => {
  try {
    const doctors = await User.getAllDoctors(); // use named export
    const [specialties] = await db.query(
      'SELECT DISTINCT specialty FROM users WHERE role = "doctor" AND specialty IS NOT NULL'
    );

    res.render('patient/doctors', {
      title: 'Find a Doctor - MedFlow',
      user: req.user,
      doctors,
      specialties: specialties.map(s => s.specialty)
    });
  } catch (error) {
    console.error('Doctors page error:', error);
    res.status(500).render('error', { message: 'Server error', error });
  }
};

// Book appointment page
export const bookAppointmentPage = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await User.findUserById(doctorId); // use named export

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).render('error', {
        message: 'Doctor not found',
        error: { status: 404 }
      });
    }

    res.render('patient/book-appointment', {
      title: 'Book Appointment - MedFlow',
      user: req.user,
      doctor
    });
  } catch (error) {
    console.error('Book appointment page error:', error);
    res.status(500).render('error', { message: 'Server error', error });
  }
};

// Doctor dashboard
export const doctorDashboard = async (req, res) => {
  try {
    const appointments = await getDoctorAppointments(req.user.id);
    const pending = await getPendingAppointments(req.user.id);
    const stats = await getDoctorStats(req.user.id);

    res.render('doctor/dashboard', {
      title: 'Doctor Dashboard - MedFlow',
      user: req.user,
      appointments,
      pending,
      stats
    });
  } catch (error) {
    console.error('Doctor dashboard error:', error);
    res.status(500).render('error', { message: 'Server error', error });
  }
};

// Appointment details page
export const appointmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await findAppointmentById(id);

    if (!appointment) {
      return res.status(404).render('error', {
        message: 'Appointment not found',
        error: { status: 404 }
      });
    }

    // Authorization check
    if (
      (req.user.role === 'patient' && appointment.patient_id !== req.user.id) ||
      (req.user.role === 'doctor' && appointment.doctor_id !== req.user.id)
    ) {
      return res.status(403).render('error', {
        message: 'Access denied',
        error: { status: 403 }
      });
    }

    const viewPath = req.user.role === 'doctor'
      ? 'doctor/appointment-details'
      : 'patient/appointment-details';

    res.render(viewPath, {
      title: 'Appointment Details - MedFlow',
      user: req.user,
      appointment
    });
  } catch (error) {
    console.error('Appointment details error:', error);
    res.status(500).render('error', { message: 'Server error', error });
  }
};
