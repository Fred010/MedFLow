// src/email/emailService.js
import { createTransport } from 'nodemailer';

const transporter = createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_PORT == 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generic send email function
export async function sendEmail(to, subject, html) {
  try {
    const mailOptions = {
      from: `"MedFlow" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error.message);
    return { success: false, error: error.message };
  }
}

// Welcome email for new patients
export async function sendWelcomeEmail(user) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background: #007bff; 
                  color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to MedFlow!</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name},</h2>
          <p>Thank you for registering with MedFlow. Your account has been successfully created.</p>
          <p>You can now browse our doctors and book appointments at your convenience.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">
            Get Started
          </a>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>The MedFlow Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(user.email, 'Welcome to MedFlow', html);
}

// Appointment confirmation for patient
export async function sendAppointmentConfirmation(appointment) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #28a745; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Appointment Request Submitted</h1>
        </div>
        <div class="content">
          <h2>Hello ${appointment.patient_name},</h2>
          <p>Your appointment request has been submitted successfully.</p>
          <div class="info-box">
            <strong>Appointment Details:</strong><br>
            Doctor: Dr. ${appointment.doctor_name}<br>
            Specialty: ${appointment.doctor_specialty}<br>
            Date & Time: ${new Date(appointment.appointment_date).toLocaleString()}<br>
            Status: <span style="color: #ffc107;">Pending Approval</span>
          </div>
          <p>You will receive an email notification once the doctor reviews your request.</p>
          <p>Best regards,<br>The MedFlow Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(
    appointment.patient_email,
    'Appointment Request Submitted',
    html
  );
}

// You would repeat this same pattern for the remaining functions:
// sendDoctorNotification, sendApprovalEmail, sendDeclineEmail, sendReminderEmail
