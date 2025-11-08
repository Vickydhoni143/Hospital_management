import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Admin from '../models/Admin.js';

export const generatePatientId = async () => {
  const lastPatient = await Patient.findOne().sort({ patientId: -1 });
  if (!lastPatient) return 'P001';
  
  const lastNumber = parseInt(lastPatient.patientId.substring(1));
  return `P${(lastNumber + 1).toString().padStart(3, '0')}`;
};

export const generateDoctorId = async () => {
  const lastDoctor = await Doctor.findOne().sort({ doctorId: -1 });
  if (!lastDoctor) return 'DR001';
  
  const lastNumber = parseInt(lastDoctor.doctorId.substring(2));
  return `DR${(lastNumber + 1).toString().padStart(3, '0')}`;
};

export const generateAdminId = async () => {
  const lastAdmin = await Admin.findOne().sort({ employeeId: -1 });
  if (!lastAdmin) return 'ADM001';
  
  const lastNumber = parseInt(lastAdmin.employeeId.substring(3));
  return `ADM${(lastNumber + 1).toString().padStart(3, '0')}`;
};