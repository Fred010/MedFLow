import { findUserById } from '../models/User.js';
import {
  createAppointment,
  findAppointmentById,
  checkAppointmentConflict,
  getPatientAppointments,
  getDoctorAppointments,
  getPendingAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  getDoctorStats
} from '../models/Appointments.js';
import emailService from '../services/emailService.js';

// Create new appointment (Patient only)
export const createAppointmentController = async (req, res) => {
  try {
    const { doctor_id, appointment_date, reason } = req.body;
    const patient_id = req.user.id;

    // Validation
    if (!doctor_id || !appointment_date || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.'
      });
    }

    // Verify doctor exists
    const doctor = await findUserById(doctor_id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.'
      });
    }

    // Check for conflicts
    const hasConflict = await checkAppointmentConflict(doctor_id, appointment_date);
    if (hasConflict) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose another time.'
      });
    }

    // Ensure future appointment date
    if (new Date(appointment_date) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date must be in the future.'
      });
    }

    // Create appointment
    const appointmentId = await createAppointment({
      patient_id,
      doctor_id,
      appointment_date,
      reason
    });

    // Retrieve appointment details
    const appointment = await findAppointmentById(appointmentId);

    // Send notification emails
    await emailService.sendAppointmentConfirmation(appointment);
    await emailService.sendDoctorNotification(appointment);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment. Please try again.'
    });
  }
};

// 🧍‍♀️ Get patient’s appointments
export const getPatientAppointmentsController = async (req, res) => {
  try {
    const appointments = await getPatientAppointments(req.user.id);
    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointments.'
    });
  }
};

// doctor’s appointments
export const getDoctorAppointmentsController = async (req, res) => {
  try {
    const appointments = await getDoctorAppointments(req.user.id);
    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointments.'
    });
  }
};

//doctor’s pending appointments
export const getPendingAppointmentsController = async (req, res) => {
  try {
    const appointments = await getPendingAppointments(req.user.id);
    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Get pending appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending appointments.'
    });
  }
};

//Get a single appointment
export const getAppointmentController = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await findAppointmentById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    // Authorization
    if (
      (req.user.role === 'patient' && appointment.patient_id !== req.user.id) ||
      (req.user.role === 'doctor' && appointment.doctor_id !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointment.'
    });
  }
};

//Approve appointment (Doctor)
export const approveAppointmentController = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await findAppointmentById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    if (appointment.doctor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Appointment already ${appointment.status}.`
      });
    }

    await updateAppointmentStatus(id, 'approved');
    const updatedAppointment = await findAppointmentById(id);
    await emailService.sendApprovalEmail(updatedAppointment);

    res.json({
      success: true,
      message: 'Appointment approved successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Approve appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve appointment.'
    });
  }
};

// Decline appointment (Doctor)
export const declineAppointmentController = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await findAppointmentById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    if (appointment.doctor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Appointment already ${appointment.status}.`
      });
    }

    await updateAppointmentStatus(id, 'declined');
    const updatedAppointment = await findAppointmentById(id);
    await emailService.sendDeclineEmail(updatedAppointment);

    res.json({
      success: true,
      message: 'Appointment declined',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Decline appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to decline appointment.'
    });
  }
};

// 🗑️ Cancel appointment (Patient)
export const cancelAppointmentController = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await findAppointmentById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    if (appointment.patient_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    await deleteAppointment(id);

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment.'
    });
  }
};

//Get doctor statistics
export const getDoctorStatsController = async (req, res) => {
  try {
    const stats = await getDoctorStats(req.user.id);
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get doctor stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics.'
    });
  }
};
