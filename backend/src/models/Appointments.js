import db from '../config/db.js';

// Create new appointment
export const createAppointment = async ({ patient_id, doctor_id, appointment_date, reason }) => {
  const query = `
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, status)
    VALUES (?, ?, ?, ?, 'pending')
  `;

  const [result] = await db.query(query, [
    patient_id,
    doctor_id,
    appointment_date,
    reason
  ]);

  return result.insertId;
};

// Find appointment by ID with joined user info
export const findAppointmentById = async (id) => {
  const query = `
    SELECT 
      a.*,
      p.name AS patient_name,
      p.email AS patient_email,
      d.name AS doctor_name,
      d.email AS doctor_email,
      d.specialty AS doctor_specialty
    FROM appointments a
    JOIN users p ON a.patient_id = p.id
    JOIN users d ON a.doctor_id = d.id
    WHERE a.id = ?
  `;

  const [rows] = await db.query(query, [id]);
  return rows[0];
};

// Get all appointments for a patient
export const getPatientAppointments = async (patientId) => {
  const query = `
    SELECT 
      a.*,
      d.name AS doctor_name,
      d.specialty AS doctor_specialty,
      d.email AS doctor_email
    FROM appointments a
    JOIN users d ON a.doctor_id = d.id
    WHERE a.patient_id = ?
    ORDER BY a.appointment_date DESC
  `;

  const [rows] = await db.query(query, [patientId]);
  return rows;
};

// Get all appointments for a doctor
export const getDoctorAppointments = async (doctorId) => {
  const query = `
    SELECT 
      a.*,
      p.name AS patient_name,
      p.email AS patient_email
    FROM appointments a
    JOIN users p ON a.patient_id = p.id
    WHERE a.doctor_id = ?
    ORDER BY a.appointment_date DESC
  `;

  const [rows] = await db.query(query, [doctorId]);
  return rows;
};

// Get pending appointments for a doctor
export const getPendingAppointments = async (doctorId) => {
  const query = `
    SELECT 
      a.*,
      p.name AS patient_name,
      p.email AS patient_email
    FROM appointments a
    JOIN users p ON a.patient_id = p.id
    WHERE a.doctor_id = ? AND a.status = 'pending'
    ORDER BY a.appointment_date ASC
  `;

  const [rows] = await db.query(query, [doctorId]);
  return rows;
};

// Update appointment status
export const updateAppointmentStatus = async (id, status) => {
  const query = `UPDATE appointments SET status = ? WHERE id = ?`;
  await db.query(query, [status, id]);
};

// Check conflicting appointments
export const checkAppointmentConflict = async (doctorId, appointmentDate, excludeId = null) => {
  let query = `
    SELECT * FROM appointments
    WHERE doctor_id = ?
    AND appointment_date = ?
    AND status IN ('pending', 'approved')
  `;
  
  const params = [doctorId, appointmentDate];

  if (excludeId) {
    query += ` AND id != ?`;
    params.push(excludeId);
  }

  const [rows] = await db.query(query, params);
  return rows.length > 0;
};

// Get upcoming approved appointments
export const getUpcomingAppointments = async (date) => {
  const query = `
    SELECT 
      a.*,
      p.name AS patient_name,
      p.email AS patient_email,
      d.name AS doctor_name,
      d.email AS doctor_email,
      d.specialty AS doctor_specialty
    FROM appointments a
    JOIN users p ON a.patient_id = p.id
    JOIN users d ON a.doctor_id = d.id
    WHERE DATE(a.appointment_date) = DATE(?)
    AND a.status = 'approved'
  `;

  const [rows] = await db.query(query, [date]);
  return rows;
};

// Delete appointment
export const deleteAppointment = async (id) => {
  const query = `DELETE FROM appointments WHERE id = ?`;
  await db.query(query, [id]);
};

// Get doctor stats
export const getDoctorAppointmentStats = async (doctorId) => {
  const query = `
    SELECT 
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'pending' THEN 1 END) AS pending,
      SUM(CASE WHEN status = 'approved' THEN 1 END) AS approved,
      SUM(CASE WHEN status = 'declined' THEN 1 END) AS declined
    FROM appointments
    WHERE doctor_id = ?
  `;

  const [rows] = await db.query(query, [doctorId]);
  return rows[0];
};
