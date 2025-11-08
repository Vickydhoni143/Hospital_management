import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

// @desc    Create new appointment (Patient books appointment)
// @route   POST /api/appointments
// @access  Private (Patient)
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;
    
    console.log('Creating appointment with data:', { doctorId, date, time, reason });

    // Get patient data from the authenticated user
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    // Generate appointmentId manually to ensure it's set
    const appointmentId = await Appointment.generateAppointmentId();
    
    console.log('Generated appointmentId:', appointmentId);

    const appointmentData = {
      patientId: patient._id,
      doctorId,
      appointmentId, // Manually set the appointmentId
      date: new Date(date),
      time,
      reason: reason || '',
      status: 'Pending'
    };

    console.log('Appointment data to save:', appointmentData);

    const appointment = await Appointment.create(appointmentData);

    // Populate the appointment with patient and doctor details
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'patientId')
      .populate('doctorId', 'doctorId name specialization')
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'fullName phoneNumber email'
        }
      });

    console.log('Appointment created successfully:', populatedAppointment);

    res.status(201).json({
      status: 'success',
      data: {
        appointment: populatedAppointment
      }
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get appointments for patient
// @route   GET /api/appointments/patient
// @access  Private (Patient)
export const getPatientAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate('doctorId', 'name specialization')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'fullName'
        }
      })
      .sort({ createdAt: -1 });

    // Transform the data to include doctor name
    const transformedAppointments = appointments.map(appointment => ({
      ...appointment.toObject(),
      doctorId: {
        ...appointment.doctorId.toObject(),
        name: appointment.doctorId.userId?.fullName || 'Unknown Doctor'
      }
    }));

    res.status(200).json({
      status: 'success',
      data: {
        appointments: transformedAppointments
      }
    });

  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get appointments for doctor
// @route   GET /api/appointments/doctor
// @access  Private (Doctor)
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    const appointments = await Appointment.find({ 
      doctorId: doctor._id,
      status: { $in: ['Approved', 'Completed'] }
    })
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'fullName phoneNumber email'
        }
      })
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      status: 'success',
      data: {
        appointments
      }
    });

  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get all appointments for admin (Pending appointments for approval)
// @route   GET /api/appointments/admin
// @access  Private (Admin)
export const getAdminAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate('doctorId', 'name specialization')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'fullName'
        }
      })
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'fullName phoneNumber email'
        }
      })
      .sort({ createdAt: -1 });

    // Transform the data to include proper names
    const transformedAppointments = appointments.map(appointment => ({
      ...appointment.toObject(),
      doctorId: {
        ...appointment.doctorId.toObject(),
        name: appointment.doctorId.userId?.fullName || 'Unknown Doctor'
      }
    }));

    res.status(200).json({
      status: 'success',
      data: {
        appointments: transformedAppointments
      }
    });

  } catch (error) {
    console.error('Get admin appointments error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update appointment status (Admin approves/rejects)
// @route   PATCH /api/appointments/:id/status
// @access  Private (Admin)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        notes: notes || ''
      },
      { new: true, runValidators: true }
    )
      .populate('doctorId', 'name specialization')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'fullName'
        }
      })
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'fullName phoneNumber email'
        }
      });

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    // Transform the doctor data
    const transformedAppointment = {
      ...appointment.toObject(),
      doctorId: {
        ...appointment.doctorId.toObject(),
        name: appointment.doctorId.userId?.fullName || 'Unknown Doctor'
      }
    };

    res.status(200).json({
      status: 'success',
      data: {
        appointment: transformedAppointment
      }
    });

  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Complete appointment (Doctor marks as completed)
// @route   PATCH /api/appointments/:id/complete
// @access  Private (Doctor)
export const completeAppointment = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    const appointment = await Appointment.findOneAndUpdate(
      { 
        _id: req.params.id,
        doctorId: doctor._id,
        status: 'Approved'
      },
      { 
        status: 'Completed'
      },
      { new: true, runValidators: true }
    )
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'fullName phoneNumber email'
        }
      });

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found or not authorized'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        appointment
      }
    });

  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private (Patient/Admin)
export const cancelAppointment = async (req, res) => {
  try {
    let appointment;
    
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      appointment = await Appointment.findOneAndDelete({
        _id: req.params.id,
        patientId: patient._id,
        status: 'Pending' // Patients can only cancel pending appointments
      });
    } else if (req.user.role === 'admin') {
      appointment = await Appointment.findByIdAndDelete(req.params.id);
    }

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found or not authorized to cancel'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};