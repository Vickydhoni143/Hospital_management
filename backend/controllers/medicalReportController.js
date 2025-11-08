import MedicalReport from '../models/MedicalReport.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Upload medical report
// @route   POST /api/medical-reports/upload
// @access  Private (Admin/Doctor)
export const uploadMedicalReport = async (req, res) => {
  let uploadedFile = null;
  
  try {
    console.log('=== UPLOAD MEDICAL REPORT START ===');
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);
    console.log('User:', req.user);

    const {
      patientIdentifier,
      title,
      description = '',
      comments = ''
    } = req.body;

    // Validate required fields
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload a file'
      });
    }

    uploadedFile = req.file;

    if (!patientIdentifier || !title) {
      // Delete uploaded file if validation fails
      if (uploadedFile && fs.existsSync(uploadedFile.path)) {
        fs.unlinkSync(uploadedFile.path);
      }
      return res.status(400).json({
        status: 'error',
        message: 'Patient ID and title are required'
      });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(uploadedFile.mimetype)) {
      if (fs.existsSync(uploadedFile.path)) {
        fs.unlinkSync(uploadedFile.path);
      }
      return res.status(400).json({
        status: 'error',
        message: 'Invalid file type. Only PDF, JPEG, PNG, and Word documents are allowed.'
      });
    }

    // Validate file size (10MB limit)
    if (uploadedFile.size > 10 * 1024 * 1024) {
      if (fs.existsSync(uploadedFile.path)) {
        fs.unlinkSync(uploadedFile.path);
      }
      return res.status(400).json({
        status: 'error',
        message: 'File size must be less than 10MB'
      });
    }

    console.log('Searching for patient with ID:', patientIdentifier);

    // Find patient by patientId string (PAT001, etc.)
    const patient = await Patient.findOne({ patientId: patientIdentifier }).populate('userId');
    if (!patient) {
      // Delete uploaded file if patient not found
      if (uploadedFile && fs.existsSync(uploadedFile.path)) {
        fs.unlinkSync(uploadedFile.path);
      }
      return res.status(404).json({
        status: 'error',
        message: `Patient not found with ID: ${patientIdentifier}`
      });
    }

    console.log('Patient found:', {
      id: patient._id,
      patientId: patient.patientId,
      name: patient.userId.fullName
    });

    // Find the doctor associated with this patient through appointments
    let assignedDoctor = null;
    let appointment = null;

    try {
      // Find the most recent appointment for this patient
      appointment = await Appointment.findOne({ patientId: patient._id })
        .sort({ createdAt: -1 })
        .populate('doctorId');
      
      if (appointment && appointment.doctorId) {
        assignedDoctor = await Doctor.findById(appointment.doctorId).populate('userId');
        console.log('Assigned doctor found:', {
          id: assignedDoctor._id,
          name: assignedDoctor.userId.fullName
        });
      } else {
        console.log('No appointment or doctor found for patient');
      }
    } catch (appointmentError) {
      console.error('Error finding appointment:', appointmentError);
      // Continue without appointment - it's not critical
    }

    // Get uploader info
    let uploaderName = '';
    let uploaderId = null;
    
    try {
      if (req.user.role === 'admin') {
        const adminUser = await User.findById(req.user.id);
        if (adminUser) {
          uploaderName = adminUser.fullName;
          uploaderId = req.user.id;
        }
      } else if (req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({ userId: req.user.id }).populate('userId');
        if (doctor) {
          uploaderName = doctor.userId.fullName;
          uploaderId = doctor._id;
        }
      }
      
      console.log('Uploader info:', { uploaderName, uploaderId, role: req.user.role });
    } catch (userError) {
      console.error('Error getting uploader info:', userError);
      // Continue with default values
    }

    // Define the correct uploads directory path (backend/uploads/medical-reports)
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'medical-reports');
    console.log('Target uploads directory:', uploadsDir);

    // Generate unique filename
    const fileExtension = path.extname(uploadedFile.originalname);
    const uniqueFilename = `report-${Date.now()}-${Math.random().toString(36).substring(2, 15)}${fileExtension}`;
    const finalFilePath = path.join(uploadsDir, uniqueFilename);

    console.log('Moving file from:', uploadedFile.path);
    console.log('Moving file to:', finalFilePath);

    // Move file from temp location to final location
    fs.renameSync(uploadedFile.path, finalFilePath);

    // Verify the file was actually saved to final location
    if (!fs.existsSync(finalFilePath)) {
      throw new Error('Uploaded file was not saved properly to final location');
    }

    console.log('File moved successfully to final location');

    console.log('Creating medical report in database...');

    // Create medical report
    const medicalReportData = {
      patientId: patient._id,
      patientName: patient.userId.fullName,
      patientIdentifier: patientIdentifier,
      doctorId: assignedDoctor ? assignedDoctor._id : null,
      doctorName: assignedDoctor ? assignedDoctor.userId.fullName : 'Not Assigned',
      adminId: req.user.role === 'admin' ? uploaderId : null,
      adminName: req.user.role === 'admin' ? uploaderName : null,
      appointmentId: appointment ? appointment._id : null,
      title: title.trim(),
      description: description.trim(),
      fileName: uploadedFile.originalname,
      fileUrl: `/uploads/medical-reports/${uniqueFilename}`,
      fileSize: uploadedFile.size,
      fileType: uploadedFile.mimetype,
      comments: comments.trim(),
      uploadedBy: req.user.role,
      status: assignedDoctor ? 'pending' : 'approved' // Auto-approve if no doctor assigned
    };

    console.log('Medical report data:', medicalReportData);

    const medicalReport = await MedicalReport.create(medicalReportData);

    console.log('Medical report created successfully:', medicalReport.reportId);

    res.status(201).json({
      status: 'success',
      message: assignedDoctor ? 
        'Medical report uploaded successfully and sent to doctor for approval' : 
        'Medical report uploaded successfully and approved (no doctor assignment needed)',
      data: {
        medicalReport: {
          _id: medicalReport._id,
          reportId: medicalReport.reportId,
          patientName: medicalReport.patientName,
          patientIdentifier: medicalReport.patientIdentifier,
          doctorName: medicalReport.doctorName,
          title: medicalReport.title,
          status: medicalReport.status,
          fileName: medicalReport.fileName,
          fileSize: medicalReport.fileSize,
          createdAt: medicalReport.createdAt
        }
      }
    });

    console.log('=== UPLOAD MEDICAL REPORT SUCCESS ===');

  } catch (error) {
    console.error('=== UPLOAD MEDICAL REPORT ERROR ===');
    console.error('Error details:', error);
    
    // Delete uploaded file on error
    if (uploadedFile && uploadedFile.path && fs.existsSync(uploadedFile.path)) {
      try {
        fs.unlinkSync(uploadedFile.path);
        console.log('Deleted uploaded file due to error');
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    
    let errorMessage = 'Failed to upload medical report';
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      errorMessage = 'Validation error: ' + validationErrors.join(', ');
      
      // Check if it's the 'reported' field error specifically
      if (validationErrors.some(msg => msg.includes('reported'))) {
        errorMessage = 'Report date is required';
      }
    } else if (error.code === 11000) {
      errorMessage = 'Report with this ID already exists';
    } else if (error.message.includes('patientId')) {
      errorMessage = 'Invalid patient data';
    }
    
    res.status(500).json({
      status: 'error',
      message: errorMessage,
      debug: process.env.NODE_ENV === 'development' ? {
        error: error.message,
        stack: error.stack
      } : undefined
    });
  }
};

// @desc    Get all medical reports (with filters)
// @route   GET /api/medical-reports
// @access  Private
export const getMedicalReports = async (req, res) => {
  try {
    console.log('=== GET MEDICAL REPORTS START ===');
    console.log('Query params:', req.query);
    console.log('User role:', req.user.role);

    const { patientId, status, page = 1, limit = 10 } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    let query = {};

    // Role-based filtering
    if (userRole === 'patient') {
      console.log('Fetching reports for patient');
      const patient = await Patient.findOne({ userId });
      if (!patient) {
        return res.status(404).json({
          status: 'error',
          message: 'Patient not found'
        });
      }
      query.patientId = patient._id;
      query.status = 'approved'; // Patients can only see approved reports
      console.log('Patient query:', query);
    } else if (userRole === 'doctor') {
      console.log('Fetching reports for doctor');
      const doctor = await Doctor.findOne({ userId });
      if (doctor) {
        query.doctorId = doctor._id;
        // Doctors can see all reports assigned to them
        if (status) {
          query.status = status;
        }
        console.log('Doctor query:', query);
      } else {
        return res.status(404).json({
          status: 'error',
          message: 'Doctor profile not found'
        });
      }
    } else if (userRole === 'admin') {
      console.log('Fetching reports for admin');
      // Admin can see all reports
      if (patientId) {
        const patient = await Patient.findOne({ patientId: patientId });
        if (patient) {
          query.patientId = patient._id;
        }
      }
      if (status) {
        query.status = status;
      }
      console.log('Admin query:', query);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    console.log('Database query:', { query, skip, limitNum });

    const medicalReports = await MedicalReport.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('patientId', 'patientId')
      .populate('doctorId', 'doctorId')
      .populate('appointmentId', 'appointmentId')
      .populate('approvedBy', 'doctorId');

    const total = await MedicalReport.countDocuments(query);

    console.log(`Found ${medicalReports.length} reports out of ${total} total`);

    res.status(200).json({
      status: 'success',
      data: {
        medicalReports,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total
        }
      }
    });

    console.log('=== GET MEDICAL REPORTS SUCCESS ===');

  } catch (error) {
    console.error('=== GET MEDICAL REPORTS ERROR ===');
    console.error('Error details:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch medical reports',
      debug: process.env.NODE_ENV === 'development' ? {
        error: error.message,
        stack: error.stack
      } : undefined
    });
  }
};

// @desc    Get single medical report
// @route   GET /api/medical-reports/:id
// @access  Private
export const getMedicalReport = async (req, res) => {
  try {
    console.log('=== GET SINGLE MEDICAL REPORT START ===');
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    console.log('Report ID:', id, 'User role:', userRole);

    let query = { _id: id };

    // Role-based access control
    if (userRole === 'patient') {
      const patient = await Patient.findOne({ userId });
      if (!patient) {
        return res.status(404).json({
          status: 'error',
          message: 'Patient not found'
        });
      }
      query.patientId = patient._id;
      query.status = 'approved';
    } else if (userRole === 'doctor') {
      const doctor = await Doctor.findOne({ userId });
      if (doctor) {
        query.doctorId = doctor._id;
      }
    }

    console.log('Final query:', query);

    const medicalReport = await MedicalReport.findOne(query)
      .populate('patientId', 'patientId')
      .populate('doctorId', 'doctorId')
      .populate('appointmentId', 'appointmentId')
      .populate('approvedBy', 'doctorId');

    if (!medicalReport) {
      console.log('Medical report not found with query:', query);
      return res.status(404).json({
        status: 'error',
        message: 'Medical report not found'
      });
    }

    console.log('Medical report found:', medicalReport.reportId);

    res.status(200).json({
      status: 'success',
      data: {
        medicalReport
      }
    });

    console.log('=== GET SINGLE MEDICAL REPORT SUCCESS ===');

  } catch (error) {
    console.error('=== GET SINGLE MEDICAL REPORT ERROR ===');
    console.error('Error details:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch medical report',
      debug: process.env.NODE_ENV === 'development' ? {
        error: error.message,
        stack: error.stack
      } : undefined
    });
  }
};

// @desc    Download medical report file
// @route   GET /api/medical-reports/:id/download
// @access  Private
export const downloadMedicalReport = async (req, res) => {
  try {
    console.log('=== DOWNLOAD MEDICAL REPORT START ===');
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    console.log('Download request for report ID:', id, 'User role:', userRole);

    let query = { _id: id };

    // Role-based access control
    if (userRole === 'patient') {
      const patient = await Patient.findOne({ userId });
      if (!patient) {
        return res.status(404).json({
          status: 'error',
          message: 'Patient not found'
        });
      }
      query.patientId = patient._id;
      query.status = 'approved';
    } else if (userRole === 'doctor') {
      const doctor = await Doctor.findOne({ userId });
      if (doctor) {
        query.doctorId = doctor._id;
      }
    }

    const medicalReport = await MedicalReport.findOne(query);

    if (!medicalReport) {
      console.log('Medical report not found with query:', query);
      return res.status(404).json({
        status: 'error',
        message: 'Medical report not found'
      });
    }

    console.log('Medical report found:', medicalReport.reportId);

    // Construct file path
    const filePath = path.join(__dirname, '..', medicalReport.fileUrl);
    console.log('Looking for file at:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('File not found at path:', filePath);
      return res.status(404).json({
        status: 'error',
        message: 'File not found'
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', medicalReport.fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${medicalReport.fileName}"`);
    res.setHeader('Content-Length', medicalReport.fileSize);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    console.log('File download initiated successfully');

  } catch (error) {
    console.error('=== DOWNLOAD MEDICAL REPORT ERROR ===');
    console.error('Error details:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to download medical report',
      debug: process.env.NODE_ENV === 'development' ? {
        error: error.message,
        stack: error.stack
      } : undefined
    });
  }
};

// @desc    Update medical report approval status
// @route   PUT /api/medical-reports/:id/approve
// @access  Private (Doctor only)
export const approveMedicalReport = async (req, res) => {
  try {
    console.log('=== APPROVE MEDICAL REPORT START ===');
    const { id } = req.params;
    const { approved, comments } = req.body;

    console.log('Report ID:', id, 'Approved:', approved, 'Comments:', comments);

    const medicalReport = await MedicalReport.findById(id);
    if (!medicalReport) {
      return res.status(404).json({
        status: 'error',
        message: 'Medical report not found'
      });
    }

    console.log('Found report:', medicalReport.reportId);

    // Check if user is a doctor and is assigned to this report
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        status: 'error',
        message: 'Only doctors can approve medical reports'
      });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(403).json({
        status: 'error',
        message: 'Doctor profile not found'
      });
    }

    console.log('Doctor found:', doctor.doctorId);

    if (!medicalReport.doctorId || medicalReport.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to approve this report'
      });
    }

    const updateData = {
      status: approved ? 'approved' : 'rejected',
      approvedByDoctor: approved,
      approvedAt: new Date(),
      approvedBy: doctor._id
    };

    if (comments) {
      updateData.comments = comments;
    }

    console.log('Update data:', updateData);

    const updatedReport = await MedicalReport.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('approvedBy', 'doctorId');

    console.log('Report updated successfully');

    res.status(200).json({
      status: 'success',
      message: `Medical report ${approved ? 'approved' : 'rejected'} successfully`,
      data: {
        medicalReport: updatedReport
      }
    });

    console.log('=== APPROVE MEDICAL REPORT SUCCESS ===');

  } catch (error) {
    console.error('=== APPROVE MEDICAL REPORT ERROR ===');
    console.error('Error details:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to update medical report status',
      debug: process.env.NODE_ENV === 'development' ? {
        error: error.message,
        stack: error.stack
      } : undefined
    });
  }
};

// @desc    Update medical report comments and status
// @route   PUT /api/medical-reports/:id
// @access  Private (Admin/Doctor)
export const updateMedicalReport = async (req, res) => {
  try {
    console.log('=== UPDATE MEDICAL REPORT START ===');
    const { id } = req.params;
    const { comments, status } = req.body;

    console.log('Report ID:', id, 'Comments:', comments, 'Status:', status);

    const medicalReport = await MedicalReport.findById(id);
    if (!medicalReport) {
      return res.status(404).json({
        status: 'error',
        message: 'Medical report not found'
      });
    }

    // Check if user has permission to update
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!medicalReport.doctorId || !medicalReport.doctorId.equals(doctor._id)) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to update this report'
        });
      }
    }

    const updateData = {};
    if (comments !== undefined) updateData.comments = comments;
    if (status !== undefined) updateData.status = status;

    console.log('Update data:', updateData);

    const updatedReport = await MedicalReport.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Report updated successfully');

    res.status(200).json({
      status: 'success',
      message: 'Medical report updated successfully',
      data: {
        medicalReport: updatedReport
      }
    });

    console.log('=== UPDATE MEDICAL REPORT SUCCESS ===');

  } catch (error) {
    console.error('=== UPDATE MEDICAL REPORT ERROR ===');
    console.error('Error details:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to update medical report',
      debug: process.env.NODE_ENV === 'development' ? {
        error: error.message,
        stack: error.stack
      } : undefined
    });
  }
};

// @desc    Get pending reports for doctor
// @route   GET /api/medical-reports/doctor/pending
// @access  Private (Doctor only)
export const getPendingReportsForDoctor = async (req, res) => {
  try {
    console.log('=== GET PENDING REPORTS START ===');
    
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor profile not found'
      });
    }

    console.log('Doctor found:', doctor.doctorId);

    const pendingReports = await MedicalReport.find({
      doctorId: doctor._id,
      status: 'pending'
    })
      .populate('patientId', 'patientId')
      .populate('appointmentId', 'appointmentId date')
      .sort({ createdAt: -1 });

    console.log(`Found ${pendingReports.length} pending reports`);

    res.status(200).json({
      status: 'success',
      data: {
        pendingReports
      }
    });

    console.log('=== GET PENDING REPORTS SUCCESS ===');

  } catch (error) {
    console.error('=== GET PENDING REPORTS ERROR ===');
    console.error('Error details:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pending reports',
      debug: process.env.NODE_ENV === 'development' ? {
        error: error.message,
        stack: error.stack
      } : undefined
    });
  }
};

// @desc    Delete medical report
// @route   DELETE /api/medical-reports/:id
// @access  Private (Admin/Doctor)
export const deleteMedicalReport = async (req, res) => {
  try {
    console.log('=== DELETE MEDICAL REPORT START ===');
    const { id } = req.params;

    console.log('Deleting report ID:', id);

    const medicalReport = await MedicalReport.findById(id);
    if (!medicalReport) {
      return res.status(404).json({
        status: 'error',
        message: 'Medical report not found'
      });
    }

    console.log('Found report to delete:', medicalReport.reportId);

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', medicalReport.fileUrl);
    console.log('Looking for file at:', filePath);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('File deleted successfully');
    } else {
      console.log('File not found at path:', filePath);
    }

    await MedicalReport.findByIdAndDelete(id);

    console.log('Database record deleted');

    res.status(200).json({
      status: 'success',
      message: 'Medical report deleted successfully'
    });

    console.log('=== DELETE MEDICAL REPORT SUCCESS ===');

  } catch (error) {
    console.error('=== DELETE MEDICAL REPORT ERROR ===');
    console.error('Error details:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete medical report',
      debug: process.env.NODE_ENV === 'development' ? {
        error: error.message,
        stack: error.stack
      } : undefined
    });
  }
};

// @desc    Get patient by ID for search
// @route   GET /api/medical-reports/patient/search/:patientId
// @access  Private (Admin/Doctor)
export const searchPatientById = async (req, res) => {
  try {
    console.log('=== SEARCH PATIENT START ===');
    const { patientId } = req.params;

    console.log('Searching for patient ID:', patientId);

    const patient = await Patient.findOne({ patientId: patientId }).populate('userId', 'fullName email phoneNumber');
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found with the provided ID'
      });
    }

    console.log('Patient found:', patient.patientId);

    const patientData = {
      _id: patient._id,
      patientId: patient.patientId,
      fullName: patient.userId.fullName,
      email: patient.userId.email,
      phoneNumber: patient.userId.phoneNumber
    };

    res.status(200).json({
      status: 'success',
      data: patientData
    });

    console.log('=== SEARCH PATIENT SUCCESS ===');

  } catch (error) {
    console.error('=== SEARCH PATIENT ERROR ===');
    console.error('Error details:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to search for patient',
      debug: process.env.NODE_ENV === 'development' ? {
        error: error.message,
        stack: error.stack
      } : undefined
    });
  }
};

// @desc    Get medical report statistics
// @route   GET /api/medical-reports/stats/overview
// @access  Private (Admin/Doctor)
export const getMedicalReportStats = async (req, res) => {
  try {
    console.log('=== GET MEDICAL REPORT STATS START ===');
    
    const userRole = req.user.role;
    const userId = req.user.id;

    let matchQuery = {};

    if (userRole === 'doctor') {
      const doctor = await Doctor.findOne({ userId });
      if (doctor) {
        matchQuery.doctorId = doctor._id;
      }
    }

    const stats = await MedicalReport.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalReports = await MedicalReport.countDocuments(matchQuery);
    
    // Convert array to object for easier consumption
    const statsObject = {
      total: totalReports,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      statsObject[stat._id] = stat.count;
    });

    console.log('Medical report stats:', statsObject);

    res.status(200).json({
      status: 'success',
      data: {
        stats: statsObject
      }
    });

    console.log('=== GET MEDICAL REPORT STATS SUCCESS ===');

  } catch (error) {
    console.error('=== GET MEDICAL REPORT STATS ERROR ===');
    console.error('Error details:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch medical report statistics',
      debug: process.env.NODE_ENV === 'development' ? {
        error: error.message,
        stack: error.stack
      } : undefined
    });
  }
};