import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  doctorId: {
    type: String,
    unique: true,
    required: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required']
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  yearsOfExperience: Number,
  qualifications: [String]
}, {
  timestamps: true
});

export default mongoose.model('Doctor', doctorSchema);