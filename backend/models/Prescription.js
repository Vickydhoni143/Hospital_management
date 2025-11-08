import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: [true, 'Patient ID is required'],
    ref: 'Patient'
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required']
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required']
  },
  doctorName: {
    type: String,
    required: [true, 'Doctor name is required']
  },
  medicine: {
    type: String,
    required: [true, 'Medicine is required']
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
    enum: ['FN', 'AN', 'night', 'morning', 'evening']
  },
  food: {
    type: String,
    required: [true, 'Food timing is required'],
    enum: ['before_food', 'after_food']
  },
  dosage: {
    type: String,
    default: ''
  },
  instructions: {
    type: String,
    default: ''
  },
  datePrescribed: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

export default mongoose.model('Prescription', prescriptionSchema);