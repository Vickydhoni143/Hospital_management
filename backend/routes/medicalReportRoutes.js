import express from 'express';
import {
  uploadMedicalReport,
  getMedicalReports,
  getMedicalReport,
  updateMedicalReport,
  deleteMedicalReport,
  approveMedicalReport,
  getPendingReportsForDoctor,
  searchPatientById
} from '../controllers/medicalReportController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload, { handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/upload', upload.single('file'), handleUploadError, uploadMedicalReport);
router.get('/', getMedicalReports);
router.get('/doctor/pending', getPendingReportsForDoctor);
router.get('/patient/search/:patientId', searchPatientById); // Add this route
router.get('/:id', getMedicalReport);
router.put('/:id', updateMedicalReport);
router.put('/:id/approve', approveMedicalReport);
router.delete('/:id', deleteMedicalReport);

export default router;