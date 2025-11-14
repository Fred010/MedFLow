// src/services/emailService.js
import { createTransport } from 'nodemailer';

export const EMAIL_SUBJECTS = {
  WELCOME: 'Welcome to MedFlow',
  REQUEST_SUBMITTED: 'Appointment Request Submitted',
  NEW_APPOINTMENT: 'New Appointment Request',
  APPROVED: 'Appointment Approved',
  DECLINED: 'Appointment Update',
  REMINDER: 'Appointment Reminder - Tomorrow'
};

// Create transporter once
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
    const info = await transporter.sendMail({
      from: `"MedFlow" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
}

// Generic HTML template
function generateTemplate({ title, greeting, body, details = {}, actionText, actionUrl, footer = 'Cheers,<br/>The MedFlow Team' }) {
  const detailsHtml = Object.entries(details).map(
    ([key, value]) => `<strong>${key}:</strong> ${value}<br/>`
  ).join('');

  const actionButton = actionText && actionUrl
    ? `<a href="${actionUrl}" style="background:#007bff;color:#fff;padding:10px 15px;text-decoration:none;border-radius:5px;">${actionText}</a>`
    : '';

  return `
    <html>
      <body style="font-family:Arial,sans-serif;color:#333;">
        <h2>${title}</h2>
        <p>${greeting}</p>
        <p>${body}</p>
        ${detailsHtml ? `<div style="background:#f9f9f9;padding:10px;border-left:4px solid #007bff;">${detailsHtml}</div>` : ''}
        ${actionButton}
        <p>${footer}</p>
      </body>
    </html>
  `;
}

// Email functions
export function sendAppointmentConfirmation(appointment) {
  const html = generateTemplate({
    title: 'Appointment Request Submitted',
    greeting: `Hello ${appointment.patient_name},`,
    body: 'Your appointment request has been successfully submitted. We will notify you once your doctor responds.',
    details: {
      'Doctor': `Dr. ${appointment.doctor_name}`,
      'Specialty': appointment.doctor_specialty,
      'Date & Time': new Date(appointment.appointment_date).toLocaleString(),
      'Status': 'Pending Approval'
    }
  });
  return sendEmail(appointment.patient_email, EMAIL_SUBJECTS.REQUEST_SUBMITTED, html);
}

export function sendDoctorNotification(appointment) {
  const html = generateTemplate({
    title: 'New Appointment Request',
    greeting: `Hello Dr. ${appointment.doctor_name},`,
    body: 'You have a new appointment request:',
    details: {
      'Patient': appointment.patient_name,
      'Date & Time': new Date(appointment.appointment_date).toLocaleString(),
      'Reason': appointment.reason
    },
    actionText: 'View Dashboard',
    actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/doctor/dashboard`
  });
  return sendEmail(appointment.doctor_email, EMAIL_SUBJECTS.NEW_APPOINTMENT, html);
}

export function sendApprovalEmail(appointment) {
  const html = generateTemplate({
    title: 'Appointment Approved',
    greeting: `Hello ${appointment.patient_name},`,
    body: 'Your appointment has been approved! Arrive 10 minutes early and bring any necessary documents.',
    details: {
      'Doctor': `Dr. ${appointment.doctor_name}`,
      'Specialty': appointment.doctor_specialty,
      'Date & Time': new Date(appointment.appointment_date).toLocaleString(),
      'Status': 'Approved'
    }
  });
  return sendEmail(appointment.patient_email, EMAIL_SUBJECTS.APPROVED, html);
}

export function sendDeclineEmail(appointment) {
  const html = generateTemplate({
    title: 'Appointment Declined',
    greeting: `Hello ${appointment.patient_name},`,
    body: 'Unfortunately, your appointment request could not be approved.',
    details: {
      'Doctor': `Dr. ${appointment.doctor_name}`,
      'Requested Date': new Date(appointment.appointment_date).toLocaleString(),
      'Status': 'Declined'
    },
    actionText: 'Book Another Appointment',
    actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/doctors`
  });
  return sendEmail(appointment.patient_email, EMAIL_SUBJECTS.DECLINED, html);
}

export function sendReminderEmail(appointment) {
  const html = generateTemplate({
    title: 'Appointment Reminder',
    greeting: `Hello ${appointment.patient_name},`,
    body: 'This is a reminder for your appointment tomorrow. Arrive 10 minutes early and bring any relevant records.',
    details: {
      'Doctor': `Dr. ${appointment.doctor_name}`,
      'Specialty': appointment.doctor_specialty,
      'Date & Time': new Date(appointment.appointment_date).toLocaleString()
    }
  });
  return sendEmail(appointment.patient_email, EMAIL_SUBJECTS.REMINDER, html);
}
