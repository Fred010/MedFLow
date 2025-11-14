import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cookieParser from 'cookie-parser';
import db from './config/db.js';
import patientRoutes from './routes/patientRoute.js';
import authRoutes from './routes/authRoute.js';
import appointmentRoutes from './routes/appointmentRoute.js';
import doctorRoutes from './routes/doctorRoute.js';
import viewRoutes from './routes/viewRoute.js';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../frontend/public')));

// Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../frontend/views'));

// Test DB connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('Database connected successfully');
  connection.release();
});


// Routes
app.use('/', viewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/patient', patientRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { 
    message: 'Page not found',
    error: { status: 404 }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error', {
    message: err.message || 'Error Message',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

});

export default app;