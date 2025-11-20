import db from '../config/db.js';
import bcrypt from 'bcryptjs';

export const createUser = async ({ name, email, password, role, specialty }) => {
  const query = `
    INSERT INTO users (name, email, password, role, specialty)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await db.query(query, [name, email, password, role || 'patient', specialty || null]);
  return result.insertId;
};

export const findUserByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

export const findUserById = async (id) => {
  const [rows] = await db.query(
    'SELECT id, name, email, role, specialty, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
};

export const getAllDoctors = async () => {
  const [rows] = await db.query(
    "SELECT id, name, email, specialty, created_at FROM users WHERE role = 'doctor' ORDER BY name ASC"
  );
  return rows;
};

export const getDoctorsBySpecialty = async (specialty) => {
  const [rows] = await db.query(
    "SELECT id, name, email, specialty, created_at FROM users WHERE role = 'doctor' AND specialty = ? ORDER BY name ASC",
    [specialty]
  );
  return rows;
};

export const verifyPassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export const updateUser = async (id, { name, email, specialty }) => {
  await db.query('UPDATE users SET name = ?, email = ?, specialty = ? WHERE id = ?', [name, email, specialty, id]);
};

export const deleteUser = async (id) => {
  await db.query('DELETE FROM users WHERE id = ?', [id]);
};
