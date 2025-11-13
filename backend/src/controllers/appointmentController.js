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
import * as emailService from '../services/emailService.js';

export const createAppointmentController = async (req, res) => {
  try {
    const { doctor_id, appointment_date, reason } = req.body;
    const patient_id = req.user.id;

    if (!doctor_id || !appointment_date || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required appointment details.'
      });
    }

    const doctor = await findUserById(doctor_id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'The selected doctor could not be found.'
      });
    }

    const hasConflict = await checkAppointmentConflict(doctor_id, appointment_date);
    if (hasConflict) {
      return res.status(400).json({
        success: false,
        message: 'That time slot is already booked. Please choose another one.'
      });
    }

    if (new Date(appointment_date) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment time must be in the future.'
      });
    }

    const appointmentId = await createAppointment({
      patient_id,
      doctor_id,
      appointment_date,
      reason
    });

    const appointment = await findAppointmentById(appointmentId);

    // Send emails using the updated emailService functions
    await emailService.sendAppointmentConfirmation(appointment);
    await emailService.sendDoctorNotification(appointment);

    res.status(201).json({
      success: true,
      message: 'Your appointment was booked successfully.',
      appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book your appointment. Please try again.'
    });
  }
};

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
      message: 'Failed to retrieve your appointments.'
    });
  }
};

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
      message: 'Failed to retrieve your dashboard statistics.'
    });
  }
};

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
      message: 'Failed to retrieve your dashboard statistics.'
    });
  }
};

export const getAppointmentController = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await findAppointmentById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'The requested appointment could not be found.'
      });
    }

    if (
      (req.user.role === 'patient' && appointment.patient_id !== req.user.id) ||
      (req.user.role === 'doctor' && appointment.doctor_id !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this appointment.'
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
      message: 'Failed to retrieve the appointment.'
    });
  }
};

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
        message: 'You are not authorized to approve this appointment.'
      });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This appointment is already ${appointment.status}.`
      });
    }

    await updateAppointmentStatus(id, 'approved');
    const updatedAppointment = await findAppointmentById(id);
    await emailService.sendApprovalEmail(updatedAppointment);

    res.json({
      success: true,
      message: 'Appointment approved successfully.',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Approve appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve the appointment.'
    });
  }
};

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
        message: 'You are not authorized to decline this appointment.'
      });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This appointment is already ${appointment.status}.`
      });
    }

    await updateAppointmentStatus(id, 'declined');
    const updatedAppointment = await findAppointmentById(id);
    await emailService.sendDeclineEmail(updatedAppointment);

    res.json({
      success: true,
      message: 'Appointment declined successfully.',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Decline appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to decline the appointment.'
    });
  }
};

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
        message: 'You are not authorized to cancel this appointment.'
      });
    }

    await deleteAppointment(id);

    res.json({
      success: true,
      message: 'Your appointment was cancelled successfully.'
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel the appointment.'
    });
  }
};

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
      message: 'Failed to retrieve dashboard statistics.'
    });
  }
};
