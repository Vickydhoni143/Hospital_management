// import Patient from '../models/Patient.js';
// import User from '../models/User.js';

// // @desc    Get current patient profile
// // @route   GET /api/patients/me
// // @access  Private (Patient only)
// export const getCurrentPatient = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // Find patient by userId and populate user details
//     const patient = await Patient.findOne({ userId })
//       .populate('userId', 'fullName email phoneNumber role');

//     if (!patient) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Patient not found'
//       });
//     }

//     // Combine patient and user data
//     const patientData = {
//       _id: patient._id,
//       userId: patient.userId._id,
//       patientId: patient.patientId,
//       fullName: patient.userId.fullName,
//       email: patient.userId.email,
//       phoneNumber: patient.userId.phoneNumber,
//       role: patient.userId.role,
//       allergies: patient.allergies,
//       createdAt: patient.createdAt,
//       updatedAt: patient.updatedAt
//     };

//     res.status(200).json({
//       status: 'success',
//       data: patientData
//     });

//   } catch (error) {
//     console.error('Get current patient error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch patient data'
//     });
//   }
// };

// // @desc    Get patient by ID
// // @route   GET /api/patients/:id
// // @access  Private
// export const getPatientById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const patient = await Patient.findOne({ patientId: id })
//       .populate('userId', 'fullName email phoneNumber');

//     if (!patient) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Patient not found'
//       });
//     }

//     const patientData = {
//       patientId: patient.patientId,
//       fullName: patient.userId.fullName,
//       email: patient.userId.email,
//       phoneNumber: patient.userId.phoneNumber,
//       allergies: patient.allergies
//     };

//     res.status(200).json({
//       status: 'success',
//       data: patientData
//     });

//   } catch (error) {
//     console.error('Get patient by ID error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch patient data'
//     });
//   }
// };


// // In patientController.js
// export const deletePatient = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const patient = await Patient.findById(id);
//     if (!patient) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Patient not found'
//       });
//     }

//     // Delete associated user
//     await User.findByIdAndDelete(patient.userId);
    
//     // Delete patient
//     await Patient.findByIdAndDelete(id);

//     res.status(200).json({
//       status: 'success',
//       message: 'Patient deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete patient error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to delete patient'
//     });
//   }
// };

// controllers/patientController.js
import Patient from '../models/Patient.js';
import User from '../models/User.js';

// @desc    Get all patients (Admin only)
// @route   GET /api/patients/all
// @access  Private (Admin only)
export const getAllPatients = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access all patients'
      });
    }

    const patients = await Patient.find()
      .populate('userId', 'fullName email phoneNumber')
      .select('patientId allergies createdAt updatedAt');

    const formattedPatients = patients.map(patient => ({
      _id: patient._id,
      patientId: patient.patientId,
      fullName: patient.userId.fullName,
      email: patient.userId.email,
      phoneNumber: patient.userId.phoneNumber,
      allergies: patient.allergies || [],
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt
    }));

    res.status(200).json({
      status: 'success',
      data: {
        patients: formattedPatients
      }
    });
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch patients'
    });
  }
};

// @desc    Get current patient profile
// @route   GET /api/patients/me
// @access  Private (Patient only)
export const getCurrentPatient = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find patient by userId and populate user details
    const patient = await Patient.findOne({ userId })
      .populate('userId', 'fullName email phoneNumber role');

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    // Combine patient and user data
    const patientData = {
      _id: patient._id,
      userId: patient.userId._id,
      patientId: patient.patientId,
      fullName: patient.userId.fullName,
      email: patient.userId.email,
      phoneNumber: patient.userId.phoneNumber,
      role: patient.userId.role,
      allergies: patient.allergies,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt
    };

    res.status(200).json({
      status: 'success',
      data: patientData
    });

  } catch (error) {
    console.error('Get current patient error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch patient data'
    });
  }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findOne({ patientId: id })
      .populate('userId', 'fullName email phoneNumber');

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    const patientData = {
      patientId: patient.patientId,
      fullName: patient.userId.fullName,
      email: patient.userId.email,
      phoneNumber: patient.userId.phoneNumber,
      allergies: patient.allergies
    };

    res.status(200).json({
      status: 'success',
      data: patientData
    });

  } catch (error) {
    console.error('Get patient by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch patient data'
    });
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private (Admin only)
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete patients'
      });
    }

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    // Delete associated user
    await User.findByIdAndDelete(patient.userId);
    
    // Delete patient
    await Patient.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete patient'
    });
  }
};