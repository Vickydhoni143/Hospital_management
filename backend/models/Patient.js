import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  patientId: {
    type: String,
    unique: true,
    required: true
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say']
  },
  address: String,
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']
  },
  allergies: [String],
  medicalHistory: String
}, {
  timestamps: true
});

export default mongoose.model('Patient', patientSchema);