import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';
import { generatePatientId, generateDoctorId, generateAdminId } from '../utils/generateId.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res, roleData = null) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber
      },
      roleData
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { email, password, role, fullName, phoneNumber, ...roleSpecificData } = req.body;

    // 1) Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email'
      });
    }

    // 2) Create user
    const newUser = await User.create({
      email,
      password,
      role,
      fullName,
      phoneNumber
    });

    let roleSpecificDoc = null;
    
    // 3) Create role-specific document
    if (role === 'patient') {
      const patientId = await generatePatientId();
      roleSpecificDoc = await Patient.create({
        userId: newUser._id,
        patientId,
        ...roleSpecificData
      });
    } else if (role === 'doctor') {
      const doctorId = await generateDoctorId();
      roleSpecificDoc = await Doctor.create({
        userId: newUser._id,
        doctorId,
        ...roleSpecificData
      });
    } else if (role === 'admin') {
      const employeeId = await generateAdminId();
      roleSpecificDoc = await Admin.create({
        userId: newUser._id,
        employeeId,
        ...roleSpecificData
      });
    }

    // 4) Send token
    createSendToken(newUser, 201, res, roleSpecificDoc);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password, selectedRole } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password'
      });
    }

    // 3) Check if user is logging in through the correct portal
    if (selectedRole && user.role !== selectedRole) {
      return res.status(403).json({
        status: 'error',
        message: `Please use the ${user.role} login portal instead`
      });
    }

    // 4) Get role-specific data
    let roleData = null;
    if (user.role === 'patient') {
      roleData = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      roleData = await Doctor.findOne({ userId: user._id });
    } else if (user.role === 'admin') {
      roleData = await Admin.findOne({ userId: user._id });
    }

    // 5) Send token
    createSendToken(user, 200, res, roleData);

  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};