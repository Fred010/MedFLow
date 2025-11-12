// src/controllers/appointmentController.js
import { findUserById } from '../models/User.js';
import {
  create as createAppointmentModel,
  findById,
  checkConflict,
  getPatientAppointments as getPatientAppointmentsModel,
  getDoctorAppointments as getDoctorAppointmentsModel,
  getPendingAppointments as getPendingAppointmentsModel,
  updateStatus,
  delete as deleteAppointment,
  getDoctorStats as getDoctorStatsModel
} from '../models/Appointment.js';
import emailService from '../utils/emailService.js';

// Create new appointment (Patient only)
export const createAppointment = async (req, res) => {
  try {
    const { doctor_id, appointment_date, reason } = req.body;
    const patient_id = req.user.id;

    if (!doctor_id || !appointment_date || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.'
      });
    }

    const doctor = await findUserById(doctor_id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.'
      });
    }

    const hasConflict = await checkConflict(doctor_id, appointment_date);
    if (hasConflict) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose another time.'
      });
    }

    if (new Date(appointment_date) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date must be in the future.'
      });
    }

    const appointmentId = await createAppointmentModel({
      patient_id,
      doctor_id,
      appointment_date,
      reason
    });

    const appointment = await findById(appointmentId);

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

// Get patient's appointments
export const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await getPatientAppointmentsModel(req.user.id);
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

// Get doctor's appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await getDoctorAppointmentsModel(req.user.id);
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

// Get pending appointments for doctor
export const getPendingAppointments = async (req, res) => {
  try {
    const appointments = await getPendingAppointmentsModel(req.user.id);
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

// Get single appointment
export const getAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

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

// Approve appointment (Doctor only)
export const approveAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await findById(id);

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

    await updateStatus(id, 'approved');
    const updatedAppointment = await findById(id);
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

// Decline appointment (Doctor only)
export const declineAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await findById(id);

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

    await updateStatus(id, 'declined');
    const updatedAppointment = await findById(id);
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

// Cancel appointment (Patient only)
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await findById(id);

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

// Get doctor statistics (for dashboard)
export const getDoctorStats = async (req, res) => {
  try {
    const stats = await getDoctorStatsModel(req.user.id);
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
