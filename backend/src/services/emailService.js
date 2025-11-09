// src/utils/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Send email
  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: `"MedFlow" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Welcome email for new patients
  async sendWelcomeEmail(user) {
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

    return await this.sendEmail(user.email, 'Welcome to MedFlow', html);
  }

  // Appointment confirmation for patient
  async sendAppointmentConfirmation(appointment) {
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

    return await this.sendEmail(
      appointment.patient_email,
      'Appointment Request Submitted',
      html
    );
  }

  // New appointment notification for doctor
  async sendDoctorNotification(appointment) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #007bff; }
          .button { display: inline-block; padding: 10px 20px; background: #007bff; 
                    color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Appointment Request</h1>
          </div>
          <div class="content">
            <h2>Hello Dr. ${appointment.doctor_name},</h2>
            <p>You have received a new appointment request.</p>
            <div class="info-box">
              <strong>Appointment Details:</strong><br>
              Patient: ${appointment.patient_name}<br>
              Date & Time: ${new Date(appointment.appointment_date).toLocaleString()}<br>
              Reason: ${appointment.reason}
            </div>
            <p>Please review and respond to this request:</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/doctor/dashboard" class="button">
              View Dashboard
            </a>
            <p>Best regards,<br>The MedFlow Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(
      appointment.doctor_email,
      'New Appointment Request',
      html
    );
  }

  // Appointment approved notification
  async sendApprovalEmail(appointment) {
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
            <h1>✓ Appointment Approved</h1>
          </div>
          <div class="content">
            <h2>Hello ${appointment.patient_name},</h2>
            <p>Great news! Your appointment has been approved.</p>
            <div class="info-box">
              <strong>Confirmed Appointment:</strong><br>
              Doctor: Dr. ${appointment.doctor_name}<br>
              Specialty: ${appointment.doctor_specialty}<br>
              Date & Time: ${new Date(appointment.appointment_date).toLocaleString()}<br>
              Status: <span style="color: #28a745;">Approved</span>
            </div>
            <p><strong>Important:</strong> Please arrive 10 minutes before your scheduled time.</p>
            <p>If you need to cancel or reschedule, please contact us as soon as possible.</p>
            <p>Best regards,<br>The MedFlow Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(
      appointment.patient_email,
      'Appointment Approved',
      html
    );
  }

  // Appointment declined notification
  async sendDeclineEmail(appointment) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; }
          .button { display: inline-block; padding: 10px 20px; background: #007bff; 
                    color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appointment Update</h1>
          </div>
          <div class="content">
            <h2>Hello ${appointment.patient_name},</h2>
            <p>We regret to inform you that your appointment request could not be approved.</p>
            <div class="info-box">
              <strong>Appointment Details:</strong><br>
              Doctor: Dr. ${appointment.doctor_name}<br>
              Requested Date: ${new Date(appointment.appointment_date).toLocaleString()}<br>
              Status: <span style="color: #dc3545;">Declined</span>
            </div>
            <p>This may be due to scheduling conflicts or doctor unavailability.</p>
            <p>Please feel free to book another appointment at a different time:</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/doctors" class="button">
              Book New Appointment
            </a>
            <p>Best regards,<br>The MedFlow Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(
      appointment.patient_email,
      'Appointment Update',
      html
    );
  }

  // Appointment reminder (24 hours before)
  async sendReminderEmail(appointment) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ffc107; color: #333; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Appointment Reminder</h1>
          </div>
          <div class="content">
            <h2>Hello ${appointment.patient_name},</h2>
            <p>This is a friendly reminder about your upcoming appointment tomorrow.</p>
            <div class="info-box">
              <strong>Appointment Details:</strong><br>
              Doctor: Dr. ${appointment.doctor_name}<br>
              Specialty: ${appointment.doctor_specialty}<br>
              Date & Time: ${new Date(appointment.appointment_date).toLocaleString()}
            </div>
            <p><strong>Please remember to:</strong></p>
            <ul>
              <li>Arrive 10 minutes early</li>
              <li>Bring your ID and insurance card</li>
              <li>Bring any relevant medical records</li>
            </ul>
            <p>Looking forward to seeing you!</p>
            <p>Best regards,<br>The MedFlow Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(
      appointment.patient_email,
      'Appointment Reminder - Tomorrow',
      html
    );
  }
}

module.exports = new EmailService();