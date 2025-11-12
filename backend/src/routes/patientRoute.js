import { Router } from 'express';
import { pool } from '../config/db.js';
import { isAuthenticated, isPatient } from '../middlewares/roleMiddleware.js';

const router = Router();

// GET /patients/dashboard - Patient dashboard
router.get('/dashboard', isAuthenticated, isPatient, async (req, res) => {
    try {
        const patientId = req.user.id;
        
        // Get patient profile
        const [patientRecords] = await pool.execute(`
            SELECT p.*, u.full_name, u.email, u.phone
            FROM patients p
            JOIN users u ON p.user_id = u.id
            WHERE u.id = ?
        `, [patientId]);
        
        if (patientRecords.length === 0) {
            return res.render('error', {
                title: 'Error',
                error: 'Patient profile not found'
            });
        }
        
        const patient = patientRecords[0];
        
        // Get appointment statistics
        const [stats] = await pool.execute(`
            SELECT 
                COUNT(*) as total_appointments,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_appointments,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_appointments,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
                COUNT(CASE WHEN status = 'declined' THEN 1 END) as declined_appointments,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_appointments
            FROM appointments 
            WHERE patient_id = ?
        `, [patient.id]);
        
        // Get upcoming appointments
        const [upcomingAppointments] = await pool.execute(`
            SELECT a.*, d.specialty, u.full_name as doctor_name, u.email as doctor_email
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u ON d.user_id = u.id
            WHERE a.patient_id = ? 
            AND a.appointment_date >= CURDATE()
            AND a.status IN ('pending', 'approved')
            ORDER BY a.appointment_date ASC, a.appointment_time ASC
            LIMIT 5
        `, [patient.id]);
        
        // Get recent appointments
        const [recentAppointments] = await pool.execute(`
            SELECT a.*, d.specialty, u.full_name as doctor_name
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u ON d.user_id = u.id
            WHERE a.patient_id = ? 
            AND a.appointment_date < CURDATE()
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
            LIMIT 5
        `, [patient.id]);
        
        res.render('patients/dashboard', {
            title: 'Patient Dashboard - MedFlow',
            patient,
            stats: stats[0],
            upcomingAppointments,
            recentAppointments
        });
        
    } catch (error) {
        console.error('Patient dashboard error:', error);
        res.render('error', {
            title: 'Error',
            error: 'Failed to load dashboard'
        });
    }
});

// GET /patients/profile - Patient profile page
router.get('/profile', isAuthenticated, isPatient, async (req, res) => {
    try {
        const patientId = req.user.id;
        
        const [patientRecords] = await pool.execute(`
            SELECT p.*, u.full_name, u.email, u.phone
            FROM patients p
            JOIN users u ON p.user_id = u.id
            WHERE u.id = ?
        `, [patientId]);
        
        if (patientRecords.length === 0) {
            return res.render('error', {
                title: 'Error',
                error: 'Patient profile not found'
            });
        }
        
        res.render('patients/profile', {
            title: 'Patient Profile - MedFlow',
            patient: patientRecords[0],
            success: null,
            error: null
        });
        
    } catch (error) {
        console.error('Patient profile error:', error);
        res.render('error', {
            title: 'Error',
            error: 'Failed to load profile'
        });
    }
});

// POST /patients/profile - Update patient profile
router.post('/profile', isAuthenticated, isPatient, async (req, res) => {
    try {
        const patientId = req.user.id;
        const { 
            date_of_birth, 
            gender, 
            address, 
            emergency_contact, 
            medical_history 
        } = req.body;
        
        // Update patient profile
        await pool.execute(`
            UPDATE patients p
            JOIN users u ON p.user_id = u.id
            SET p.date_of_birth = ?, p.gender = ?, p.address = ?, 
                p.emergency_contact = ?, p.medical_history = ?
            WHERE u.id = ?
        `, [date_of_birth, gender, address, emergency_contact, medical_history, patientId]);
        
        // Get updated profile
        const [patientRecords] = await pool.execute(`
            SELECT p.*, u.full_name, u.email, u.phone
            FROM patients p
            JOIN users u ON p.user_id = u.id
            WHERE u.id = ?
        `, [patientId]);
        
        res.render('patients/profile', {
            title: 'Patient Profile - MedFlow',
            patient: patientRecords[0],
            success: 'Profile updated successfully',
            error: null
        });
        
    } catch (error) {
        console.error('Profile update error:', error);
        
        // Get current profile for display
        const [patientRecords] = await pool.execute(`
            SELECT p.*, u.full_name, u.email, u.phone
            FROM patients p
            JOIN users u ON p.user_id = u.id
            WHERE u.id = ?
        `, [req.user.id]);
        
        res.render('patients/profile', {
            title: 'Patient Profile - MedFlow',
            patient: patientRecords[0],
            success: null,
            error: 'Failed to update profile. Please try again.'
        });
    }
});

// GET /patients/doctors - Browse available doctors
router.get('/doctors', isAuthenticated, isPatient, async (req, res) => {
    try {
        const { specialty } = req.query;
        
        let query = `
            SELECT d.*, u.full_name, u.email, u.phone
            FROM doctors d
            JOIN users u ON d.user_id = u.id
            WHERE u.is_active = true
        `;
        let params = [];
        
        if (specialty) {
            query += ' AND d.specialty = ?';
            params.push(specialty);
        }
        
        query += ' ORDER BY u.full_name ASC';
        
        const [doctors] = await pool.execute(query, params);
        
        // Get available specialties
        const [specialties] = await pool.execute(`
            SELECT DISTINCT specialty FROM doctors d
            JOIN users u ON d.user_id = u.id
            WHERE u.is_active = true
            ORDER BY specialty ASC
        `);
        
        res.render('patients/doctors', {
            title: 'Find Doctors - MedFlow',
            doctors,
            specialties,
            selectedSpecialty: specialty || ''
        });
        
    } catch (error) {
        console.error('Error loading doctors:', error);
        res.render('error', {
            title: 'Error',
            error: 'Failed to load doctors'
        });
    }
});

// GET /patients/appointments - Patient's appointments
router.get('/appointments', isAuthenticated, isPatient, async (req, res) => {
    try {
        const { status } = req.query;
        const patientId = req.user.id;
        
        // Get patient ID from patients table
        const [patientRecords] = await pool.execute(
            'SELECT id FROM patients WHERE user_id = ?',
            [patientId]
        );
        
        if (patientRecords.length === 0) {
            return res.render('error', {
                title: 'Error',
                error: 'Patient profile not found'
            });
        }
        
        const patientDbId = patientRecords[0].id;
        
        let query = `
            SELECT a.*, d.specialty, u.full_name as doctor_name, u.email as doctor_email
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u ON d.user_id = u.id
            WHERE a.patient_id = ?
        `;
        let params = [patientDbId];
        
        if (status) {
            query += ' AND a.status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';
        
        const [appointments] = await pool.execute(query, params);
        
        res.render('patients/appointments', {
            title: 'My Appointments - MedFlow',
            appointments,
            currentStatus: status || ''
        });
        
    } catch (error) {
        console.error('Error loading appointments:', error);
        res.render('error', {
            title: 'Error',
            error: 'Failed to load appointments'
        });
    }
});

// GET /patients/medical-history - Patient's medical history
router.get('/medical-history', isAuthenticated, isPatient, async (req, res) => {
    try {
        const patientId = req.user.id;
        
        // Get patient profile
        const [patientRecords] = await pool.execute(`
            SELECT p.*, u.full_name, u.email
            FROM patients p
            JOIN users u ON p.user_id = u.id
            WHERE u.id = ?
        `, [patientId]);
        
        if (patientRecords.length === 0) {
            return res.render('error', {
                title: 'Error',
                error: 'Patient profile not found'
            });
        }
        
        const patient = patientRecords[0];
        
        // Get completed appointments with notes
        const [medicalHistory] = await pool.execute(`
            SELECT a.*, d.specialty, u.full_name as doctor_name
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u ON d.user_id = u.id
            WHERE a.patient_id = ? 
            AND a.status = 'completed'
            AND (a.notes IS NOT NULL AND a.notes != '')
            ORDER BY a.appointment_date DESC
        `, [patient.id]);
        
        res.render('patients/medical-history', {
            title: 'Medical History - MedFlow',
            patient,
            medicalHistory
        });
        
    } catch (error) {
        console.error('Error loading medical history:', error);
        res.render('error', {
            title: 'Error',
            error: 'Failed to load medical history'
        });
    }
});

export default router;