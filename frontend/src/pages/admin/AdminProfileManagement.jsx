// import React, { useState } from 'react';

// const AdminProfileManagement = ({ adminData }) => {
//   const [profileData, setProfileData] = useState({
//     fullName: adminData?.fullName || '',
//     email: adminData?.email || '',
//     phoneNumber: adminData?.phoneNumber || ''
//   });

//   const handleChange = (e) => {
//     setProfileData({
//       ...profileData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Handle profile update
//     console.log('Profile updated:', profileData);
//   };

//   return (
//     <div className="management-section">
//       <div className="section-header">
//         <h2>Profile Management</h2>
//         <p>Update your personal information</p>
//       </div>
      
//       <form onSubmit={handleSubmit} className="profile-form">
//         <div className="form-group">
//           <label htmlFor="fullName">Full Name</label>
//           <input
//             type="text"
//             id="fullName"
//             name="fullName"
//             value={profileData.fullName}
//             onChange={handleChange}
//             required
//           />
//         </div>
        
//         <div className="form-group">
//           <label htmlFor="email">Email Address</label>
//           <input
//             type="email"
//             id="email"
//             name="email"
//             value={profileData.email}
//             onChange={handleChange}
//             required
//           />
//         </div>
        
//         <div className="form-group">
//           <label htmlFor="phoneNumber">Phone Number</label>
//           <input
//             type="tel"
//             id="phoneNumber"
//             name="phoneNumber"
//             value={profileData.phoneNumber}
//             onChange={handleChange}
//             required
//           />
//         </div>
        
//         <button type="submit" className="hospital-btn hospital-btn-primary">
//           Update Profile
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AdminProfileManagement;




// src/pages/admin/AdminProfileManagement.jsx
import React, { useState, useEffect } from 'react';

const AdminProfileManagement = ({ adminData }) => {
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    department: '',
    employeeId: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '', show: false });

  useEffect(() => {
    // Get data from localStorage (set during login)
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const storedRoleData = JSON.parse(localStorage.getItem('roleData') || '{}');
    
    setProfileData({
      fullName: storedUser.fullName || '',
      email: storedUser.email || '',
      phoneNumber: storedUser.phoneNumber || '',
      department: storedRoleData.department || '',
      employeeId: storedRoleData.employeeId || ''
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
      // Update localStorage with new data
      const updatedUser = {
        ...JSON.parse(localStorage.getItem('user') || '{}'),
        fullName: profileData.fullName,
        phoneNumber: profileData.phoneNumber
      };
      
      const updatedRoleData = {
        ...JSON.parse(localStorage.getItem('roleData') || '{}'),
        department: profileData.department
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('roleData', JSON.stringify(updatedRoleData));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showFeedbackMessage('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Update error:', error);
      showFeedbackMessage('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Profile Management</h2>
        <p>Update your personal information</p>
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
          <label htmlFor="employeeId">Employee ID</label>
          <input
            type="text"
            id="employeeId"
            name="employeeId"
            value={profileData.employeeId}
            onChange={handleChange}
            disabled={true} // Employee ID cannot be changed
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

export default AdminProfileManagement;