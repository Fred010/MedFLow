// src/models/User.js
import db from '../config/db.js';
import { hash, compare } from 'bcrypt';

// Create new user
export const createUser = async (userData) => {
  const { name, email, password, role, specialty } = userData;
  const hashedPassword = await hash(password, 10);

  const query = `
    INSERT INTO users (name, email, password, role, specialty)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await db.query(query, [
    name,
    email,
    hashedPassword,
    role || 'patient',
    specialty || null,
  ]);

  return { id: result.insertId, name, email, role, specialty };
};

// Find user by email
export const findUserByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

// Find user by ID
export const findUserById = async (id) => {
  const [rows] = await db.query(
    'SELECT id, name, email, role, specialty, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
};

// Get all doctors
export const getAllDoctors = async () => {
  const [rows] = await db.query(
    "SELECT id, name, email, specialty, created_at FROM users WHERE role = 'doctor' ORDER BY name ASC"
  );
  return rows;
};

// Get doctors by specialty
export const getDoctorsBySpecialty = async (specialty) => {
  const [rows] = await db.query(
    "SELECT id, name, email, specialty, created_at FROM users WHERE role = 'doctor' AND specialty = ? ORDER BY name ASC",
    [specialty]
  );
  return rows;
};

// Verify password
export const verifyPassword = async (plainPassword, hashedPassword) => {
  return await compare(plainPassword, hashedPassword);
};

// Update user
export const updateUser = async (id, updates) => {
  const { name, email, specialty } = updates;
  await db.query(
    'UPDATE users SET name = ?, email = ?, specialty = ? WHERE id = ?',
    [name, email, specialty, id]
  );
};

// Delete user
export const deleteUser = async (id) => {
  await db.query('DELETE FROM users WHERE id = ?', [id]);
};
