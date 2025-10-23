# MedFLow – Clinic Appointment Management System

**MedFLow** is a full-stack web application that streamlines the appointment booking process between patients and doctors. The system features real-time email notifications and server-side rendered views using **EJS templates**, providing a smooth and responsive experience for both patients and doctors.

---

## Features

### For Patients

- User registration and authentication
- Browse available doctors by specialty
- Book appointments with preferred doctors
- View appointment history and status
- Receive email notifications for appointment updates

### For Doctors

- Secure login system
- View all pending appointment requests
- Approve or decline appointments
- Manage appointment schedule
- Automatic email notifications for new bookings

### System Features

- JWT-based authentication with session management
- Automated email notifications via Nodemailer
- MySQL database with relational design
- Password encryption using bcrypt
- Server-side rendering with EJS templates
- Responsive UI using Bootstrap 5 and custom CSS

---

## Tech Stack

**Backend:**

- Node.js
- Express.js
- MySQL
- JWT (JSON Web Tokens)
- bcrypt
- Nodemailer
- cookie-parser

**Frontend:**

- EJS (Embedded JavaScript Templates)
- CSS3 (Custom Styles)
- Bootstrap 5
- Vanilla JavaScript

---

## Prerequisites

Before running the project, make sure you have the following installed:

- Node.js
- npm
- MySQL
- A Gmail account for email notifications

---

## Project Structure

```
medFlow/
│
├── backend/
│   ├── config/
│   │   └── db.js                  # MySQL connection
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── appointmentController.js
│   │   │   ├── doctorController.js
│   │   │   └── viewController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Appointment.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── appointmentRoutes.js
│   │   │   ├── doctorRoutes.js
│   │   │   └── viewRoutes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   └── utils/
│   │       └── emailService.js
│   ├── server.js                  # Main entry point
│   ├── .env
│   ├── package.json
│   └── .gitignore
│
├── frontend/
│   ├── views/                       # EJS templates
│   │   ├── layouts/
│   │   │   ├── header.ejs
│   │   │   └── footer.ejs
│   │   ├── partials/
│   │   │   ├── navbar.ejs
│   │   │   └── alerts.ejs
│   │   ├── auth/
│   │   │   ├── login.ejs
│   │   │   └── signup.ejs
│   │   ├── patient/
│   │   │   ├── dashboard.ejs
│   │   │   ├── book-appointment.ejs
│   │   │   └── appointments.ejs
│   │   ├── doctor/
│   │   │   ├── dashboard.ejs
│   │   │   └── appointments.ejs
│   │   ├── index.ejs
│   │   └── error.ejs
│   ├── public/
│   │   ├── css/
│   │   │   ├── style.css
│   │   │   ├── dashboard.css
│   │   │   └── auth.css
│   │   ├── js/
│   │   │   ├── main.js
│   │   │   ├── dashboard.js
│   │   │   └── appointments.js
│   └── package.json
│
└── README.md
```

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/medflow.git
cd medibook-appointment-system
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Configure `.env` with your MySQL and Gmail credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=medibook
JWT_SECRET=your_jwt_secret
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=yourgmailpassword
```

4. Run database migrations / create tables (based on models).

5. Start the backend server:

```bash
npm start
```

6. Access the application at: `http://localhost:5000`

---

## API Endpoints

### **Auth Routes**

| Method | Endpoint       | Description                 |
| ------ | -------------- | --------------------------- |
| POST   | `/auth/signup` | Register a new patient      |
| POST   | `/auth/login`  | Login for patient or doctor |
| POST   | `/auth/logout` | Logout user (clear cookies) |

### **Appointment Routes**

| Method | Endpoint                    | Description                           |
| ------ | --------------------------- | ------------------------------------- |
| GET    | `/appointments`             | Get all appointments (doctor/patient) |
| POST   | `/appointments/book`        | Patient books new appointment         |
| PATCH  | `/appointments/:id/approve` | Doctor approves appointment           |
| PATCH  | `/appointments/:id/decline` | Doctor declines appointment           |
| GET    | `/appointments/history`     | Get past appointments for patient     |

### **Doctor Routes**

| Method | Endpoint       | Description             |
| ------ | -------------- | ----------------------- |
| GET    | `/doctors`     | Get list of all doctors |
| GET    | `/doctors/:id` | Get doctor details      |

### **View Routes (EJS pages)**

| Method | Endpoint            | Description              |
| ------ | ------------------- | ------------------------ |
| GET    | `/`                 | Landing page             |
| GET    | `/login`            | Login page               |
| GET    | `/signup`           | Signup page              |
| GET    | `/dashboard`        | Doctor/Patient dashboard |
| GET    | `/book-appointment` | Appointment booking page |

---

## ✅ MVP Features Checklist

- EJS template engine setup
- Bootstrap 5 integration
- Custom CSS styling
- Vanilla JS for interactivity
- User authentication (JWT + cookies)
- Patient registration & login
- Doctor login
- Appointment booking
- View appointments (both roles)
- Approve/decline appointments
- Email notifications
- Responsive design

---
