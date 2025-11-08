import Prescription from '../models/Prescription.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

// @desc    Create new prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
export const createPrescription = async (req, res) => {
  try {
    const { 
      patientId, 
      patientName, 
      medicine, 
      time, 
      food, 
      dosage, 
      instructions 
    } = req.body;

    const doctorId = req.user.id;

    // Get doctor details
    const doctor = await Doctor.findOne({ userId: doctorId }).populate('userId');
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    // Verify patient exists
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    const prescription = await Prescription.create({
      patientId,
      patientName,
      doctorId: doctor._id,
      doctorName: doctor.userId.fullName,
      medicine,
      time,
      food,
      dosage,
      instructions,
      datePrescribed: new Date()
    });

    res.status(201).json({
      status: 'success',
      message: 'Prescription created successfully',
      data: prescription
    });

  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get prescriptions by patient ID
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private (Patient only)
export const getPrescriptionsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await Prescription.find({ patientId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: prescriptions
    });

  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch prescriptions'
    });
  }
};

// @desc    Get prescriptions by doctor
// @route   GET /api/prescriptions/doctor
// @access  Private (Doctor only)
export const getPrescriptionsByDoctor = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    const prescriptions = await Prescription.find({ doctorId: doctor._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: prescriptions
    });

  } catch (error) {
    console.error('Get doctor prescriptions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch prescriptions'
    });
  }
};

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
// @access  Private (Doctor only)
export const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const prescription = await Prescription.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!prescription) {
      return res.status(404).json({
        status: 'error',
        message: 'Prescription not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Prescription updated successfully',
      data: prescription
    });

  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};