// src/services/emailService.js
import { createTransport } from 'nodemailer';

// ✅ Reusable email subjects
export const EMAIL_SUBJECTS = {
  WELCOME: 'Welcome to MedFlow',
  REQUEST_SUBMITTED: 'Appointment Request Submitted',
  NEW_APPOINTMENT: 'New Appointment Request',
  APPROVED: 'Appointment Approved',
  DECLINED: 'Appointment Update',
  REMINDER: 'Appointment Reminder - Tomorrow'
};

class EmailService {
  constructor() {
    this.transporter = createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Core reusable sender
  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: `"MedFlow" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email send error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // 🩺 Appointment Confirmation (to Patient)
  async sendAppointmentConfirmation(appointment) {
    const html = `
      <html>
      <body style="font-family:Arial,sans-serif;color:#333;">
        <h2>Appointment Request Submitted</h2>
        <p>Hello ${appointment.patient_name},</p>
        <p>Your appointment request has been successfully submitted.</p>
        <div style="background:#f9f9f9;padding:10px;border-left:4px solid #28a745;">
          <strong>Doctor:</strong> Dr. ${appointment.doctor_name}<br/>
          <strong>Specialty:</strong> ${appointment.doctor_specialty}<br/>
          <strong>Date & Time:</strong> ${new Date(appointment.appointment_date).toLocaleString()}<br/>
          <strong>Status:</strong> <span style="color:#ffc107;">Pending Approval</span>
        </div>
        <p>We’ll notify you when your doctor approves or declines this request.</p>
        <p>Best regards,<br/>The MedFlow Team</p>
      </body>
      </html>
    `;

    return this.sendEmail(appointment.patient_email, EMAIL_SUBJECTS.REQUEST_SUBMITTED, html);
  }

  // 👨‍⚕️ New Appointment Notification (to Doctor)
  async sendDoctorNotification(appointment) {
    const html = `
      <html>
      <body style="font-family:Arial,sans-serif;color:#333;">
        <h2>New Appointment Request</h2>
        <p>Hello Dr. ${appointment.doctor_name},</p>
        <p>You have a new appointment request:</p>
        <div style="background:#f9f9f9;padding:10px;border-left:4px solid #007bff;">
          <strong>Patient:</strong> ${appointment.patient_name}<br/>
          <strong>Date & Time:</strong> ${new Date(appointment.appointment_date).toLocaleString()}<br/>
          <strong>Reason:</strong> ${appointment.reason}
        </div>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/doctor/dashboard" 
           style="background:#007bff;color:#fff;padding:10px 15px;text-decoration:none;border-radius:5px;">
           View Dashboard
        </a>
        <p>Best regards,<br/>The MedFlow Team</p>
      </body>
      </html>
    `;

    return this.sendEmail(appointment.doctor_email, EMAIL_SUBJECTS.NEW_APPOINTMENT, html);
  }

  // ✅ Appointment Approved (to Patient)
  async sendApprovalEmail(appointment) {
    const html = `
      <html>
      <body style="font-family:Arial,sans-serif;color:#333;">
        <h2>Appointment Approved</h2>
        <p>Hello ${appointment.patient_name},</p>
        <p>Your appointment has been approved!</p>
        <div style="background:#f9f9f9;padding:10px;border-left:4px solid #28a745;">
          <strong>Doctor:</strong> Dr. ${appointment.doctor_name}<br/>
          <strong>Specialty:</strong> ${appointment.doctor_specialty}<br/>
          <strong>Date & Time:</strong> ${new Date(appointment.appointment_date).toLocaleString()}<br/>
          <strong>Status:</strong> <span style="color:#28a745;">Approved</span>
        </div>
        <p>Please arrive 10 minutes early and bring necessary documents.</p>
        <p>Best regards,<br/>The MedFlow Team</p>
      </body>
      </html>
    `;

    return this.sendEmail(appointment.patient_email, EMAIL_SUBJECTS.APPROVED, html);
  }

  // ❌ Appointment Declined (to Patient)
  async sendDeclineEmail(appointment) {
    const html = `
      <html>
      <body style="font-family:Arial,sans-serif;color:#333;">
        <h2>Appointment Declined</h2>
        <p>Hello ${appointment.patient_name},</p>
        <p>Unfortunately, your appointment request could not be approved.</p>
        <div style="background:#f9f9f9;padding:10px;border-left:4px solid #dc3545;">
          <strong>Doctor:</strong> Dr. ${appointment.doctor_name}<br/>
          <strong>Requested Date:</strong> ${new Date(appointment.appointment_date).toLocaleString()}<br/>
          <strong>Status:</strong> <span style="color:#dc3545;">Declined</span>
        </div>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/doctors" 
           style="background:#007bff;color:#fff;padding:10px 15px;text-decoration:none;border-radius:5px;">
           Book Another Appointment
        </a>
        <p>Best regards,<br/>The MedFlow Team</p>
      </body>
      </html>
    `;

    return this.sendEmail(appointment.patient_email, EMAIL_SUBJECTS.DECLINED, html);
  }

  // ⏰ Reminder Email (to Patient)
  async sendReminderEmail(appointment) {
    const html = `
      <html>
      <body style="font-family:Arial,sans-serif;color:#333;">
        <h2>Appointment Reminder</h2>
        <p>Hello ${appointment.patient_name},</p>
        <p>This is a friendly reminder about your appointment tomorrow:</p>
        <div style="background:#f9f9f9;padding:10px;border-left:4px solid #ffc107;">
          <strong>Doctor:</strong> Dr. ${appointment.doctor_name}<br/>
          <strong>Specialty:</strong> ${appointment.doctor_specialty}<br/>
          <strong>Date & Time:</strong> ${new Date(appointment.appointment_date).toLocaleString()}
        </div>
        <p>Please arrive 10 minutes early and bring any relevant records.</p>
        <p>Best regards,<br/>The MedFlow Team</p>
      </body>
      </html>
    `;

    return this.sendEmail(appointment.patient_email, EMAIL_SUBJECTS.REMINDER, html);
  }
}

export default new EmailService();
