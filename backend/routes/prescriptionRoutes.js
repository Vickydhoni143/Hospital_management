import express from 'express';
import { 
  createPrescription, 
  getPrescriptionsByPatient, 
  getPrescriptionsByDoctor,
  updatePrescription 
} from '../controllers/prescriptionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createPrescription);
router.get('/patient/:patientId', protect, getPrescriptionsByPatient);
router.get('/doctor', protect, getPrescriptionsByDoctor);
router.put('/:id', protect, updatePrescription);

export default router;