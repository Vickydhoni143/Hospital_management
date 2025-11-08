import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

// @desc    Get all doctors with user details
// @route   GET /api/doctors
// @access  Public
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('userId', 'fullName email phoneNumber')
      .select('doctorId specialization department yearsOfExperience qualifications shift timings days contactNumber');

    const formattedDoctors = doctors.map(doctor => ({
      _id: doctor._id,
      id: doctor._id, // Add both _id and id for frontend compatibility
      doctorId: doctor.doctorId,
      name: doctor.userId.fullName, // This is what frontend expects
      email: doctor.userId.email,
      phoneNumber: doctor.userId.phoneNumber,
      specialization: doctor.specialization,
      department: doctor.department,
      yearsOfExperience: doctor.yearsOfExperience,
      experience: doctor.yearsOfExperience, // Add experience alias for frontend
      qualifications: doctor.qualifications || [],
      shift: doctor.shift,
      timings: doctor.timings,
      days: doctor.days,
      contactNumber: doctor.contactNumber
    }));

    res.status(200).json({
      status: 'success',
      data: {
        doctors: formattedDoctors // Wrap in doctors object as frontend expects
      }
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch doctors'
    });
  }
};

// @desc    Get doctors by specialization
// @route   GET /api/doctors/specialization/:specialization
// @access  Public
export const getDoctorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;
    
    // Use case-insensitive search
    const doctors = await Doctor.find({ 
      specialization: new RegExp(specialization, 'i') 
    })
      .populate('userId', 'fullName email phoneNumber')
      .select('doctorId specialization department yearsOfExperience qualifications shift timings days contactNumber');

    const formattedDoctors = doctors.map(doctor => ({
      _id: doctor._id,
      id: doctor._id,
      doctorId: doctor.doctorId,
      name: doctor.userId.fullName,
      email: doctor.userId.email,
      phoneNumber: doctor.userId.phoneNumber,
      specialization: doctor.specialization,
      department: doctor.department,
      yearsOfExperience: doctor.yearsOfExperience,
      experience: doctor.yearsOfExperience,
      qualifications: doctor.qualifications || [],
      shift: doctor.shift,
      timings: doctor.timings,
      days: doctor.days,
      contactNumber: doctor.contactNumber
    }));

    res.status(200).json({
      status: 'success',
      data: formattedDoctors
    });
  } catch (error) {
    console.error('Get doctors by specialization error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch doctors'
    });
  }
};

// @desc    Get all available specializations
// @route   GET /api/doctors/specializations/all
// @access  Public
export const getSpecializations = async (req, res) => {
  try {
    const specializations = await Doctor.distinct('specialization');
    
    // Filter out null/empty values and sort alphabetically
    const filteredSpecializations = specializations
      .filter(spec => spec && spec.trim() !== '')
      .sort();

    res.status(200).json({
      status: 'success',
      data: {
        specializations: filteredSpecializations
      }
    });
  } catch (error) {
    console.error('Get specializations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch specializations'
    });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor only)
export const updateDoctorProfile = async (req, res) => {
  try {
    const { 
      fullName, 
      phoneNumber, 
      specialization, 
      department, 
      yearsOfExperience, 
      qualifications 
    } = req.body;

    // Get user ID from the token
    const userId = req.user.id;

    // Update User document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        fullName, 
        phoneNumber 
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update Doctor document
    const updatedDoctor = await Doctor.findOneAndUpdate(
      { userId: userId },
      { 
        specialization, 
        department, 
        yearsOfExperience, 
        qualifications 
      },
      { new: true, runValidators: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor profile not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser._id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber
        },
        doctor: {
          id: updatedDoctor._id,
          specialization: updatedDoctor.specialization,
          department: updatedDoctor.department,
          yearsOfExperience: updatedDoctor.yearsOfExperience,
          qualifications: updatedDoctor.qualifications
        }
      }
    });

  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// In doctorController.js
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    // Delete associated user
    await User.findByIdAndDelete(doctor.userId);
    
    // Delete doctor
    await Doctor.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete doctor'
    });
  }
};