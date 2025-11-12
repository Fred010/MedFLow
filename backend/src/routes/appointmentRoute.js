import express from "express";
import {
  createAppointmentController,
  getPatientAppointmentsController,
  cancelAppointmentController,
  getDoctorAppointmentsController,
  getPendingAppointmentsController,
  approveAppointmentController,
  declineAppointmentController,
  getAppointmentController,
  getDoctorStatsController
} from "../controllers/appointmentController.js";

import { authMiddleware, optionalAuth } from "../middlewares/authMiddleware.js";
import { isPatient, isDoctor } from "../middlewares/roleMiddleware.js";

const router = express.Router();

//All routes require authentication
router.use(authMiddleware);

//Patient routes
router.post("/", isPatient, createAppointmentController);
router.get("/my-appointments", isPatient, getPatientAppointmentsController);
router.delete("/:id", isPatient, cancelAppointmentController);

//Doctor routes
router.get("/doctor/appointments", isDoctor, getDoctorAppointmentsController);
router.get("/doctor/pending", isDoctor, getPendingAppointmentsController);
router.get("/doctor/stats", isDoctor, getDoctorStatsController);
router.patch("/:id/approve", isDoctor, approveAppointmentController);
router.patch("/:id/decline", isDoctor, declineAppointmentController);

// 🔍 Common routes (both patient and doctor)
router.get("/:id", getAppointmentController);

export default router;
