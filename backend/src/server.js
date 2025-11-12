// server.js
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import db from './config/db.js';

// Route imports (make sure these export default routers)
import viewRoute from './routes/viewRoute.js';
import authRoute from './routes/authRoute.js';
import appointmentRoute from './routes/appointmentRoute.js';
import doctorRoute from './routes/doctorRoute.js';

dotenv.config();

// Recreate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use(express.static(join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✓ Database connected successfully');
  connection.release();
});


app.use('/', viewRoute);
app.use('/api/auth', authRoute);
app.use('/api/appointments', appointmentRoute);
app.use('/api/doctors', doctorRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 Not Found',
    message: 'Page not found',
    error: { status: 404 },
  });
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error', {
    title: 'Error',
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});


app.listen(PORT, () => {
  console.log(`✓ HTTP Server running on http://localhost:${PORT}`);
});

export default app;
