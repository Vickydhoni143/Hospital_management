// routes/patientRoutes.js
import express from 'express';
import { 
  getCurrentPatient, 
  getPatientById, 
  getAllPatients,
  deletePatient 
} from '../controllers/patientController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getCurrentPatient);
router.get('/all', protect, getAllPatients); // Add this line for getting all patients
router.get('/:id', protect, getPatientById);
router.delete('/:id', protect, deletePatient); // Add delete route

export default router;