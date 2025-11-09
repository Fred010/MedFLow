// src/models/User.js
const db = require('../../config/db');
const bcrypt = require('bcrypt');

class User {
  // Create new user
  static async create(userData) {
    const { name, email, password, role, specialty } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (name, email, password, role, specialty)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.promise().query(query, [
      name,
      email,
      hashedPassword,
      role || 'patient',
      specialty || null
    ]);
    
    return result.insertId;
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.promise().query(query, [email]);
    return rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT id, name, email, role, specialty, created_at FROM users WHERE id = ?';
    const [rows] = await db.promise().query(query, [id]);
    return rows[0];
  }

  // Get all doctors
  static async getAllDoctors() {
    const query = `
      SELECT id, name, email, specialty, created_at 
      FROM users 
      WHERE role = 'doctor'
      ORDER BY name ASC
    `;
    const [rows] = await db.promise().query(query);
    return rows;
  }

  // Get doctors by specialty
  static async getDoctorsBySpecialty(specialty) {
    const query = `
      SELECT id, name, email, specialty, created_at 
      FROM users 
      WHERE role = 'doctor' AND specialty = ?
      ORDER BY name ASC
    `;
    const [rows] = await db.promise().query(query, [specialty]);
    return rows;
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user
  static async update(id, updates) {
    const { name, email, specialty } = updates;
    const query = `
      UPDATE users 
      SET name = ?, email = ?, specialty = ?
      WHERE id = ?
    `;
    await db.promise().query(query, [name, email, specialty, id]);
  }

  // Delete user
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    await db.promise().query(query, [id]);
  }
}

module.exports = User;