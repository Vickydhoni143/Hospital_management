import React, { useState, useEffect } from 'react';
import ConfirmationModal from '../../components/ConfirmationModal';

const ManageDoctors = ({ adminData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specializations, setSpecializations] = useState([]);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    doctorId: null,
    doctorName: ''
  });
  const [actionLoading, setActionLoading] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/doctors`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setDoctors(result.data.doctors);
        
        // Extract unique specializations
        const uniqueSpecializations = [...new Set(result.data.doctors.map(doc => doc.specialization))];
        setSpecializations(['All', ...uniqueSpecializations]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = filterSpecialization === '' || 
                                 filterSpecialization === 'All' || 
                                 doctor.specialization === filterSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  const handleEdit = (doctorId) => {
    console.log('Edit doctor:', doctorId);
    // Implement edit functionality
    alert(`Editing doctor with ID: ${doctorId}`);
  };

  const handleDeleteClick = (doctorId, doctorName) => {
    setDeleteModal({
      isOpen: true,
      doctorId,
      doctorName
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.doctorId) return;

    setActionLoading(deleteModal.doctorId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/doctors/${deleteModal.doctorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove doctor from local state
        setDoctors(prev => prev.filter(doctor => doctor._id !== deleteModal.doctorId));
        
        // Show success message (you can add a toast notification here)
        // alert(`Doctor ${deleteModal.doctorName} deleted successfully!`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete doctor');
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      alert(`Error deleting doctor: ${error.message}`);
    } finally {
      setActionLoading(null);
      setDeleteModal({ isOpen: false, doctorId: null, doctorName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, doctorId: null, doctorName: '' });
  };

  if (loading) {
    return (
      <div className="management-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Manage Doctors</h2>
        <p>View and manage registered hospital doctors</p>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search doctors by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-dropdown">
          <select
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
            className="filter-select"
          >
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Doctors Table */}
      <div className="table-container">
        <table className="doctors-table">
          <thead>
            <tr>
              <th>Doctor ID</th>
              <th>Doctor Name</th>
              <th>Specialization</th>
              <th>Department</th>
              <th>Experience</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map(doctor => (
              <tr key={doctor._id}>
                <td>{doctor.doctorId}</td>
                <td>Dr. {doctor.name}</td>
                <td>{doctor.specialization}</td>
                <td>{doctor.department}</td>
                <td>{doctor.yearsOfExperience} years</td>
                <td>{doctor.phoneNumber}</td>
                <td>
                  <div className="action-buttons">
                    {/* <button 
                      className="hospital-btn hospital-btn-primary edit-btn"
                      onClick={() => handleEdit(doctor._id)}
                      disabled={actionLoading === doctor._id}
                    >
                      <i className="fas fa-edit"></i>
                      Edit
                    </button> */}
                    <button 
                      className="hospital-btn hospital-btn-danger delete-btn"
                      onClick={() => handleDeleteClick(doctor._id, doctor.name)}
                      disabled={actionLoading === doctor._id}
                    >
                      {actionLoading === doctor._id ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-trash"></i>
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredDoctors.length === 0 && (
          <div className="no-data-message">
            <p>No doctors found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Doctor"
        message={`Are you sure you want to delete Dr. ${deleteModal.doctorName}? This action cannot be undone and all associated data will be permanently removed.`}
        confirmText="Delete Doctor"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default ManageDoctors;