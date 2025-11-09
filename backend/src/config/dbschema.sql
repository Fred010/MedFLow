-- database/schema.sql
-- Create database
CREATE DATABASE IF NOT EXISTS medflow;
USE medflow;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('patient', 'doctor', 'admin') DEFAULT 'patient',
    specialty VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_specialty (specialty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'declined', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_patient (patient_id),
    INDEX idx_doctor (doctor_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status),
    INDEX idx_doctor_date (doctor_id, appointment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample doctor data
INSERT INTO users (name, email, password, role, specialty) VALUES
('Dr. Sarah Johnson', 'sarah.johnson@medflow.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'Cardiology'),
('Dr. Michael Chen', 'michael.chen@medflow.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'Pediatrics'),
('Dr. Emily Brown', 'emily.brown@medflow.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'Dermatology'),
('Dr. David Wilson', 'david.wilson@medflow.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'Orthopedics'),
('Dr. Lisa Anderson', 'lisa.anderson@medflow.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'Neurology'),
('Dr. Robert Martinez', 'robert.martinez@medflow.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'General Practice'),
('Dr. Jennifer Taylor', 'jennifer.taylor@medflow.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'Obstetrics'),
('Dr. James Thompson', 'james.thompson@medflow.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'Psychiatry');

-- Insert sample patient
INSERT INTO users (name, email, password, role) VALUES
('John Doe', 'john.doe@example.com', '$2b$10$YourHashedPasswordHere', 'patient');

-- Note: Replace $2b$10$YourHashedPasswordHere with actual bcrypt hashed passwords
-- You can generate them using: bcrypt.hash('password123', 10)