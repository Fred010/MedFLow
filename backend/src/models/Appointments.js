import db from '../config/db.js';

export const createAppointment = async ({ patient_id, doctor_id, appointment_date, reason }) => {
  const query = `
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, status)
    VALUES (?, ?, ?, ?, 'pending')
  `;
  const [result] = await db.query(query, [patient_id, doctor_id, appointment_date, reason]);
  return result.insertId;
};

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

export const updateAppointmentStatus = async (id, status) => {
  await db.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
};

export const checkAppointmentConflict = async (doctorId, appointmentDate, excludeId = null) => {
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
  const [rows] = await db.query(query, params);
  return rows.length > 0;
};

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

export const deleteAppointment = async (id) => {
  await db.query('DELETE FROM appointments WHERE id = ?', [id]);
};

export const getDoctorStats = async (doctorId) => {
  const query = `
    SELECT 
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN status = 'declined' THEN 1 ELSE 0 END) AS declined
    FROM appointments
    WHERE doctor_id = ?
  `;
  const [rows] = await db.query(query, [doctorId]);
  return rows[0];
};
