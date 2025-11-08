import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAdminAppointments,
  updateAppointmentStatus,
  completeAppointment,
  cancelAppointment
} from '../controllers/appointmentController.js';

const router = express.Router();

// Patient routes
router.post('/', protect, createAppointment);
router.get('/patient', protect, getPatientAppointments);
router.delete('/:id', protect, cancelAppointment);

// Doctor routes
router.get('/doctor', protect, getDoctorAppointments);
router.patch('/:id/complete', protect, completeAppointment);

// Admin routes
router.get('/admin', protect, getAdminAppointments);
router.patch('/:id/status', protect, updateAppointmentStatus);

export default router;