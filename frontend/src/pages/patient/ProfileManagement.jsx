import React, { useState, useEffect } from 'react';

const ProfileManagement = ({ patientData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    bloodGroup: '',
    allergies: '',
    medicalHistory: ''
  });
  
  const [feedback, setFeedback] = useState({ message: '', type: '', show: false });

  useEffect(() => {
    if (patientData) {
      setProfileData({
        fullName: patientData.fullName || 'Patient User',
        email: patientData.email || '',
        phoneNumber: patientData.phoneNumber || '',
        dateOfBirth: patientData.dateOfBirth || '',
        gender: patientData.gender || '',
        address: patientData.address || '',
        bloodGroup: patientData.bloodGroup || '',
        allergies: patientData.allergies || '',
        medicalHistory: patientData.medicalHistory || ''
      });
    }
  }, [patientData]);

  const showFeedbackMessage = (message, type = 'success') => {
    setFeedback({ message, type, show: true });
    setTimeout(() => {
      setFeedback({ message: '', type: '', show: false });
    }, 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Simulate saving profile data
    const updatedUserData = {
      ...patientData,
      ...profileData
    };
    
    localStorage.setItem('loggedInUser', JSON.stringify(updatedUserData));
    setIsEditing(false);
    showFeedbackMessage('Profile updated successfully!', 'success');
  };

  const handleCancel = () => {
    // Reset form data to original patient data
    setProfileData({
      fullName: patientData.fullName || 'Patient User',
      email: patientData.email || '',
      phoneNumber: patientData.phoneNumber || '',
      dateOfBirth: patientData.dateOfBirth || '',
      gender: patientData.gender || '',
      address: patientData.address || '',
      bloodGroup: patientData.bloodGroup || '',
      allergies: patientData.allergies || '',
      medicalHistory: patientData.medicalHistory || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="profile-management-section">
      <div className="profile-header">
        <h2>Profile Management</h2>
        <p>Manage your personal and medical information</p>
      </div>

      <form className="profile-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={profileData.fullName}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={profileData.phoneNumber}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={profileData.dateOfBirth}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={profileData.gender}
              onChange={handleInputChange}
              disabled={!isEditing}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="bloodGroup">Blood Group</label>
            <select
              id="bloodGroup"
              name="bloodGroup"
              value={profileData.bloodGroup}
              onChange={handleInputChange}
              disabled={!isEditing}
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            value={profileData.address}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Enter your complete address"
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="allergies">Allergies</label>
            <textarea
              id="allergies"
              name="allergies"
              value={profileData.allergies}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="List any known allergies"
              rows="3"
            />
          </div>
          <div className="form-group">
            <label htmlFor="medicalHistory">Medical History</label>
            <textarea
              id="medicalHistory"
              name="medicalHistory"
              value={profileData.medicalHistory}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Any significant medical history"
              rows="3"
            />
          </div>
        </div>

        <div className="form-actions">
          {!isEditing ? (
            <button 
              type="button" 
              className="hospital-btn hospital-btn-primary"
              onClick={() => setIsEditing(true)}
            >
              <i className="fas fa-edit"></i>
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                type="button" 
                className="hospital-btn hospital-btn-primary"
                onClick={handleSave}
              >
                <i className="fas fa-save"></i>
                Save Changes
              </button>
              <button 
                type="button" 
                className="hospital-btn hospital-btn-secondary"
                onClick={handleCancel}
              >
                <i className="fas fa-times"></i>
                Cancel
              </button>
            </div>
          )}
          
          {/* Feedback message for profile updates */}
          {feedback.show && (
            <div className={`feedback-message ${feedback.type}`}>
              <div className="feedback-content">
                <i className={`fas ${feedback.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                <span>{feedback.message}</span>
              </div>
              <button 
                className="feedback-close"
                onClick={() => setFeedback({ message: '', type: '', show: false })}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileManagement;