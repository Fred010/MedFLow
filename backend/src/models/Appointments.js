// src/models/Appointment.js
import db from '../config/db.js';

// Create new appointment
export async function create({ patient_id, doctor_id, appointment_date, reason }) {
  const query = `
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, status)
    VALUES (?, ?, ?, ?, 'pending')
  `;
  const [result] = await db.promise().query(query, [patient_id, doctor_id, appointment_date, reason]);
  return result.insertId;
}

// Find appointment by ID with user details
export async function findById(id) {
  const query = `
    SELECT 
      a.*,
      p.name as patient_name,
      p.email as patient_email,
      d.name as doctor_name,
      d.email as doctor_email,
      d.specialty as doctor_specialty
    FROM appointments a
    JOIN users p ON a.patient_id = p.id
    JOIN users d ON a.doctor_id = d.id
    WHERE a.id = ?
  `;
  const [rows] = await db.promise().query(query, [id]);
  return rows[0];
}

// Get all appointments for a patient
export async function getPatientAppointments(patientId) {
  const query = `
    SELECT 
      a.*,
      d.name as doctor_name,
      d.specialty as doctor_specialty,
      d.email as doctor_email
    FROM appointments a
    JOIN users d ON a.doctor_id = d.id
    WHERE a.patient_id = ?
    ORDER BY a.appointment_date DESC
  `;
  const [rows] = await db.promise().query(query, [patientId]);
  return rows;
}

// Get all appointments for a doctor
export async function getDoctorAppointments(doctorId) {
  const query = `
    SELECT 
      a.*,
      p.name as patient_name,
      p.email as patient_email
    FROM appointments a
    JOIN users p ON a.patient_id = p.id
    WHERE a.doctor_id = ?
    ORDER BY a.appointment_date DESC
  `;
  const [rows] = await db.promise().query(query, [doctorId]);
  return rows;
}

// Get pending appointments for doctor
export async function getPendingAppointments(doctorId) {
  const query = `
    SELECT 
      a.*,
      p.name as patient_name,
      p.email as patient_email
    FROM appointments a
    JOIN users p ON a.patient_id = p.id
    WHERE a.doctor_id = ? AND a.status = 'pending'
    ORDER BY a.appointment_date ASC
  `;
  const [rows] = await db.promise().query(query, [doctorId]);
  return rows;
}

// Update appointment status
export async function updateStatus(id, status) {
  const query = 'UPDATE appointments SET status = ? WHERE id = ?';
  await db.promise().query(query, [status, id]);
}

// Check for conflicting appointments
export async function checkConflict(doctorId, appointmentDate, excludeId = null) {
  let query = `
    SELECT * FROM appointments 
    WHERE doctor_id = ? 
    AND appointment_date = ? 
    AND status IN ('pending', 'approved')
  `;
  const params = [doctorId, appointmentDate];
  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }
  const [rows] = await db.promise().query(query, params);
  return rows.length > 0;
}

// Get upcoming appointments (for reminders)
export async function getUpcoming(date) {
  const query = `
    SELECT 
      a.*,
      p.name as patient_name,
      p.email as patient_email,
      d.name as doctor_name,
      d.email as doctor_email,
      d.specialty as doctor_specialty
    FROM appointments a
    JOIN users p ON a.patient_id = p.id
    JOIN users d ON a.doctor_id = d.id
    WHERE DATE(a.appointment_date) = DATE(?)
    AND a.status = 'approved'
  `;
  const [rows] = await db.promise().query(query, [date]);
  return rows;
}

// Delete appointment
export async function deleteAppointment(id) {
  const query = 'DELETE FROM appointments WHERE id = ?';
  await db.promise().query(query, [id]);
}

// Get appointment statistics for doctor dashboard
export async function getDoctorStats(doctorId) {
  const query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'declined' THEN 1 ELSE 0 END) as declined
    FROM appointments
    WHERE doctor_id = ?
  `;
  const [rows] = await db.promise().query(query, [doctorId]);
  return rows[0];
}
