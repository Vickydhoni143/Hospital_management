import express from 'express';
import {
  submitFeedback,
  getApprovedFeedbacks,
  getAllFeedbacks,
  approveFeedback,
  deleteFeedback,
  getFeedbackStats
} from '../controllers/feedbackController.js';

const router = express.Router();

// Public routes
router.post('/submit', submitFeedback);
router.get('/approved', getApprovedFeedbacks);

// Admin routes (add auth middleware later if needed)
router.get('/all', getAllFeedbacks);
router.get('/stats', getFeedbackStats);
router.patch('/approve/:id', approveFeedback);
router.delete('/delete/:id', deleteFeedback);

export default router;