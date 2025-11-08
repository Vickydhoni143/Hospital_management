import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient ID is required']
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required']
  },
  appointmentId: {
    type: String,
    unique: true,
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  time: {
    type: String,
    required: [true, 'Time is required']
  },
  reason: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  collection: 'appointments'
});

// Fixed pre-save hook with better error handling
appointmentSchema.pre('save', async function(next) {
  try {
    if (this.isNew && !this.appointmentId) {
      const lastAppointment = await mongoose.model('Appointment')
        .findOne()
        .sort({ createdAt: -1 });
      
      let nextNumber = 1;
      if (lastAppointment && lastAppointment.appointmentId) {
        const lastNumber = parseInt(lastAppointment.appointmentId.replace('APT', ''));
        nextNumber = lastNumber + 1;
      }
      
      this.appointmentId = `APT${nextNumber.toString().padStart(4, '0')}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Alternative: If the pre-save hook still doesn't work, use this method
appointmentSchema.statics.generateAppointmentId = async function() {
  const lastAppointment = await this.findOne().sort({ createdAt: -1 });
  let nextNumber = 1;
  if (lastAppointment && lastAppointment.appointmentId) {
    const lastNumber = parseInt(lastAppointment.appointmentId.replace('APT', ''));
    nextNumber = lastNumber + 1;
  }
  return `APT${nextNumber.toString().padStart(4, '0')}`;
};

export default mongoose.model('Appointment', appointmentSchema);