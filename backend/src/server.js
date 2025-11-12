// server.js
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import express from "express";
import cookieParser from "cookie-parser";
import db from "./config/db.js";

import authRoutes from "./routes/authRoute.js";
import appointmentRoutes from "./routes/appointmentRoute.js";
import doctorRoutes from "./routes/doctorRoute.js";
import viewRoutes from "./routes/viewRoute.js";

// Ensure __dirname works in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✓ Database connected successfully');
  connection.release();
});

// Routes
app.use('/', viewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { 
    message: 'Page not found',
    error: { status: 404 }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error', {
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);

  // Log loaded DB config to confirm dotenv works
  console.log('DB CONFIG:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ? '***' : '(none)',
    database: process.env.DB_NAME,
  });
});

export default app;
