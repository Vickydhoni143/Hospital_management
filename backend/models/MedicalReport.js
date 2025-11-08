import mongoose from 'mongoose';

const medicalReportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    unique: true,
    required: false
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientIdentifier: {
    type: String, // Stores the patient ID string (PAT001, etc.)
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  doctorName: {
    type: String
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  adminName: {
    type: String
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  comments: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'archived'],
    default: 'pending'
  },
  uploadedBy: {
    type: String,
    enum: ['admin', 'doctor'],
    required: true
  },
  approvedByDoctor: {
    type: Boolean,
    default: false
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }
}, {
  timestamps: true
});

// Generate report ID before saving
medicalReportSchema.pre('save', async function(next) {
  try {
    if (this.isNew && !this.reportId) {
      const lastReport = await mongoose.model('MedicalReport')
        .findOne()
        .sort({ createdAt: -1 });
      
      let nextNumber = 1;
      if (lastReport && lastReport.reportId) {
        const lastNumber = parseInt(lastReport.reportId.replace('REP', ''));
        nextNumber = lastNumber + 1;
      }
      
      this.reportId = `REP${nextNumber.toString().padStart(4, '0')}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('MedicalReport', medicalReportSchema);