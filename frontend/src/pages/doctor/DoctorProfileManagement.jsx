
import React, { useState, useEffect } from 'react';

const DoctorProfileManagement = ({ doctorData }) => {
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    specialization: '',
    department: '',
    yearsOfExperience: '',
    qualifications: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '', show: false });

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    // Get data from localStorage (set during login)
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const storedRoleData = JSON.parse(localStorage.getItem('roleData') || '{}');
    
    setProfileData({
      fullName: storedUser.fullName || '',
      email: storedUser.email || '',
      phoneNumber: storedUser.phoneNumber || '',
      specialization: storedRoleData.specialization || '',
      department: storedRoleData.department || '',
      yearsOfExperience: storedRoleData.yearsOfExperience || '',
      qualifications: storedRoleData.qualifications ? storedRoleData.qualifications.join(', ') : ''
    });
  }, []);

  const showFeedbackMessage = (message, type = 'success') => {
    setFeedback({ message, type, show: true });
    setTimeout(() => {
      setFeedback({ message: '', type: '', show: false });
    }, 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Prepare update data
      const updateData = {
        fullName: profileData.fullName,
        phoneNumber: profileData.phoneNumber,
        specialization: profileData.specialization,
        department: profileData.department,
        yearsOfExperience: profileData.yearsOfExperience,
        qualifications: profileData.qualifications ? profileData.qualifications.split(',').map(q => q.trim()) : []
      };

      // Make API call to update doctor profile
      const response = await fetch(`${API_BASE_URL}/doctors/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();

      // Update localStorage with new data
      const updatedUser = {
        ...JSON.parse(localStorage.getItem('user') || '{}'),
        fullName: profileData.fullName,
        phoneNumber: profileData.phoneNumber
      };
      
      const updatedRoleData = {
        ...JSON.parse(localStorage.getItem('roleData') || '{}'),
        specialization: profileData.specialization,
        department: profileData.department,
        yearsOfExperience: profileData.yearsOfExperience,
        qualifications: profileData.qualifications ? profileData.qualifications.split(',').map(q => q.trim()) : []
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('roleData', JSON.stringify(updatedRoleData));
      
      showFeedbackMessage('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Update error:', error);
      showFeedbackMessage(error.message || 'Failed to update profile. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Profile Management</h2>
        <p>Update your professional information</p>
      </div>
      
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={profileData.fullName}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={profileData.email}
            onChange={handleChange}
            required
            disabled={true} // Email cannot be changed
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={profileData.phoneNumber}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="specialization">Specialization</label>
          
          <select id="specialization" name="specialization" value={profileData.specialization} onChange={handleChange} required disabled={isLoading}>
            <option value="Cardiology">Cardiology</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Neurology">Neurology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Psychiatry">Psychiatry</option>
            <option value="Dentistry">Dentistry</option>
            <option value="Gynecology">Gynecology</option>
            <option value="Ophthalmology">Ophthalmology</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="General Medicine">General Medicine</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="department">Department</label>
          <input
            type="text"
            id="department"
            name="department"
            value={profileData.department}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="yearsOfExperience">Years of Experience</label>
          <input
            type="number"
            id="yearsOfExperience"
            name="yearsOfExperience"
            value={profileData.yearsOfExperience}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="qualifications">Qualifications</label>
          <textarea
            id="qualifications"
            name="qualifications"
            value={profileData.qualifications}
            onChange={handleChange}
            placeholder="Enter your qualifications (comma separated)"
            rows="3"
            disabled={isLoading}
          />
        </div>
        
        <button 
          type="submit" 
          className="hospital-btn hospital-btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Updating...' : 'Update Profile'}
        </button>

        {/* Feedback message */}
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
      </form>
    </div>
  );
};

export default DoctorProfileManagement;