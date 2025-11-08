import express from 'express';
import {
  getAllDoctors,
  getDoctorsBySpecialization,
  updateDoctorProfile,
  deleteDoctor
} from '../controllers/doctorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllDoctors);
router.get('/specialization/:specialization', getDoctorsBySpecialization);

router.put('/profile', protect, updateDoctorProfile);
// In your doctorRoutes.js
router.delete('/:id', protect, deleteDoctor);

export default router;