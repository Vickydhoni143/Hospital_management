import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: false,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin', 'visitor'],
    default: 'visitor'
  },
  approved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  }
});

export default mongoose.model('Feedback', feedbackSchema);