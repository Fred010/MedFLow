import pool  from '../config/db.js';

// Dashboard
export const getDashboard = async (req, res) => {
    try {
        const patientId = req.user.id;

        const [patientRecords] = await pool.execute(`
            SELECT p.*, u.full_name, u.email, u.phone
            FROM patients p
            JOIN users u ON p.user_id = u.id
            WHERE u.id = ?
        `, [patientId]);

        if (!patientRecords.length) {
            return res.render('error', { title: 'Error', error: 'We couldn’t find your profile.' });
        }

        const patient = patientRecords[0];

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

        const [upcomingAppointments] = await pool.execute(`
            SELECT a.*, d.specialty, u.full_name as doctor_name, u.email as doctor_email
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u ON d.user_id = u.id
            WHERE a.patient_id = ? AND a.appointment_date >= CURDATE() AND a.status IN ('pending', 'approved')
            ORDER BY a.appointment_date ASC, a.appointment_time ASC
            LIMIT 5
        `, [patient.id]);

        const [recentAppointments] = await pool.execute(`
            SELECT a.*, d.specialty, u.full_name as doctor_name
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u ON d.user_id = u.id
            WHERE a.patient_id = ? AND a.appointment_date < CURDATE()
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
            LIMIT 5
        `, [patient.id]);

        res.render('patient/dashboard', {
            title: 'Patient Dashboard - MedFlow',
            patient,
            stats: stats[0],
            upcomingAppointments,
            recentAppointments
        });

    } catch (err) {
        console.error('Dashboard error:', err);
        res.render('error', { title: 'Error', error: 'Could not load your dashboard. Please try again.' });
    }
};

// Profile - GET
export const getProfile = async (req, res) => {
    try {
        const patientId = req.user.id;

        const [patientRecords] = await pool.execute(`
            SELECT p.*, u.full_name, u.email, u.phone
            FROM patients p
            JOIN users u ON p.user_id = u.id
            WHERE u.id = ?
        `, [patientId]);

        if (!patientRecords.length) {
            return res.render('error', { title: 'Error', error: 'Profile not found.' });
        }

        res.render('patient/profile', {
            title: 'Patient Profile - MedFlow',
            patient: patientRecords[0],
            success: null,
            error: null
        });

    } catch (err) {
        console.error('Profile load error:', err);
        res.render('error', { title: 'Error', error: 'Could not load your profile.' });
    }
};

// Profile - POST (update)
export const updateProfile = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { date_of_birth, gender, address, emergency_contact, medical_history } = req.body;

        await pool.execute(`
            UPDATE patients p
            JOIN users u ON p.user_id = u.id
            SET p.date_of_birth = ?, p.gender = ?, p.address = ?, p.emergency_contact = ?, p.medical_history = ?
            WHERE u.id = ?
        `, [date_of_birth, gender, address, emergency_contact, medical_history, patientId]);

        const [patientRecords] = await pool.execute(`
            SELECT p.*, u.full_name, u.email, u.phone
            FROM patients p
            JOIN users u ON p.user_id = u.id
            WHERE u.id = ?
        `, [patientId]);

        res.render('patient/profile', {
            title: 'Patient Profile - MedFlow',
            patient: patientRecords[0],
            success: 'Profile updated successfully!',
            error: null
        });

    } catch (err) {
        console.error('Profile update error:', err);

        const [patientRecords] = await pool.execute(`
            SELECT p.*, u.full_name, u.email, u.phone
            FROM patients p
            JOIN users u ON p.user_id = u.id
            WHERE u.id = ?
        `, [req.user.id]);

        res.render('patient/profile', {
            title: 'Patient Profile - MedFlow',
            patient: patientRecords[0],
            success: null,
            error: 'Failed to update profile. Please try again.'
        });
    }
};

// Browse doctors
export const getDoctors = async (req, res) => {
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

        const [specialties] = await pool.execute(`
            SELECT DISTINCT specialty FROM doctors d
            JOIN users u ON d.user_id = u.id
            WHERE u.is_active = true
            ORDER BY specialty ASC
        `);

        res.render('patient/doctors', {
            title: 'Find Doctors - MedFlow',
            doctors,
            specialties,
            selectedSpecialty: specialty || ''
        });

    } catch (err) {
        console.error('Doctors load error:', err);
        res.render('error', { title: 'Error', error: 'Could not load doctors list.' });
    }
};

// Appointments
export const getAppointments = async (req, res) => {
    try {
        const { status } = req.query;
        const patientId = req.user.id;

        const [patientRecords] = await pool.execute('SELECT id FROM patients WHERE user_id = ?', [patientId]);
        if (!patientRecords.length) return res.render('error', { title: 'Error', error: 'Profile not found.' });

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

    } catch (err) {
        console.error('Appointments load error:', err);
        res.render('error', { title: 'Error', error: 'Could not load your appointments.' });
    }
};

// Medical history
export const getMedicalHistory = async (req, res) => {
    try {
        const patientId = req.user.id;

        const [patientRecords] = await pool.execute(`
            SELECT p.*, u.full_name, u.email
            FROM patients p
            JOIN users u ON p.user_id = u.id
            WHERE u.id = ?
        `, [patientId]);

        if (!patientRecords.length) return res.render('error', { title: 'Error', error: 'Profile not found.' });

        const patient = patientRecords[0];

        const [medicalHistory] = await pool.execute(`
            SELECT a.*, d.specialty, u.full_name as doctor_name
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u ON d.user_id = u.id
            WHERE a.patient_id = ? AND a.status = 'completed' AND (a.notes IS NOT NULL AND a.notes != '')
            ORDER BY a.appointment_date DESC
        `, [patient.id]);

        res.render('patients/medical-history', {
            title: 'Medical History - MedFlow',
            patient,
            medicalHistory
        });

    } catch (err) {
        console.error('Medical history load error:', err);
        res.render('error', { title: 'Error', error: 'Could not load medical history.' });
    }
};
