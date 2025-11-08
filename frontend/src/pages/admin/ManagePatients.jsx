import React, { useState, useEffect } from 'react';
import ConfirmationModal from '../../components/ConfirmationModal';

const ManagePatients = ({ adminData }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    patientId: null,
    patientName: ''
  });
  const [actionLoading, setActionLoading] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/patients/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Patients data:', result); // Debug log
        setPatients(result.data.patients || []);
      } else {
        console.error('Failed to fetch patients:', response.status);
        setPatients([]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => 
    patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (patientId, patientName) => {
    setDeleteModal({
      isOpen: true,
      patientId,
      patientName
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.patientId) return;

    setActionLoading(deleteModal.patientId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/patients/${deleteModal.patientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove patient from local state
        setPatients(prev => prev.filter(patient => patient._id !== deleteModal.patientId));
        
        // Show success message
        // alert(`Patient ${deleteModal.patientName} deleted successfully!`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete patient');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert(`Error deleting patient: ${error.message}`);
    } finally {
      setActionLoading(null);
      setDeleteModal({ isOpen: false, patientId: null, patientName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, patientId: null, patientName: '' });
  };

  if (loading) {
    return (
      <div className="management-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Manage Patients</h2>
        <p>View and manage registered patients</p>
      </div>

      {/* Search Section */}
      <div className="search-filter-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search patients by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      <div className="table-container">
        <table className="patients-table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Patient Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Allergies</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map(patient => (
              <tr key={patient._id}>
                <td>{patient.patientId}</td>
                <td>{patient.fullName}</td>
                <td>{patient.email}</td>
                <td>{patient.phoneNumber}</td>
                <td>
                  {patient.allergies && patient.allergies.length > 0 
                    ? patient.allergies.join(', ') 
                    : 'None'
                  }
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="hospital-btn hospital-btn-danger delete-btn"
                      onClick={() => handleDeleteClick(patient._id, patient.fullName)}
                      disabled={actionLoading === patient._id}
                    >
                      {actionLoading === patient._id ? (
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

        {filteredPatients.length === 0 && !loading && (
          <div className="no-data-message">
            <p>No patients found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Patient"
        message={`Are you sure you want to delete ${deleteModal.patientName}? This action cannot be undone and all patient records will be permanently removed.`}
        confirmText="Delete Patient"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default ManagePatients;