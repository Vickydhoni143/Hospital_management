import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    unique: true,
    required: true
  },
  department: {
    type: String,
    default: 'Administration'
  }
}, {
  timestamps: true
});

export default mongoose.model('Admin', adminSchema);