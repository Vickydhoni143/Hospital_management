



import React, { useState, useEffect } from 'react';

const PrescriptionManagement = ({ doctorData }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '', show: false });

  const [newPrescription, setNewPrescription] = useState({
    patientId: '',
    patientName: '',
    medicine: '',
    time: '',
    food: '',
    dosage: '',
    instructions: ''
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchDoctorPrescriptions();
  }, []);

  const fetchDoctorPrescriptions = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/prescriptions/doctor`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch prescriptions');
      
      const result = await response.json();
      if (result.status === 'success') {
        setPrescriptions(result.data);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      showFeedback('Failed to load prescriptions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type, show: true });
    setTimeout(() => {
      setFeedback({ message: '', type: '', show: false });
    }, 5000);
  };

  const handleInputChange = (e) => {
    setNewPrescription({
      ...newPrescription,
      [e.target.name]: e.target.value
    });
  };

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    
    if (!newPrescription.patientId || !newPrescription.patientName || 
        !newPrescription.medicine || !newPrescription.time || !newPrescription.food) {
      showFeedback('Please fill all required fields', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPrescription)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create prescription');
      }

      const result = await response.json();
      
      setPrescriptions([result.data, ...prescriptions]);
      setNewPrescription({
        patientId: '',
        patientName: '',
        medicine: '',
        time: '',
        food: '',
        dosage: '',
        instructions: ''
      });
      
      showFeedback('Prescription added successfully!', 'success');
    } catch (error) {
      console.error('Error adding prescription:', error);
      showFeedback(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="prescription-section">
      <div className="section-header">
        <h2>Prescription Management</h2>
        <p>Manage and prescribe medications for patients</p>
      </div>

      {/* Feedback Message */}
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

      <div className="prescription-form">
        <h4>Add New Prescription</h4>
        <form onSubmit={handleAddPrescription} className="form-grid">
          <div className="form-group">
            <label htmlFor="patientId">Patient ID *</label>
            <input
              type="text"
              id="patientId"
              name="patientId"
              value={newPrescription.patientId}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="patientName">Patient Name *</label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              value={newPrescription.patientName}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="medicine">Prescribed Medicine *</label>
            <input
              type="text"
              id="medicine"
              name="medicine"
              value={newPrescription.medicine}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Time *</label>
            <select
              id="time"
              name="time"
              value={newPrescription.time}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            >
              <option value="">Select Time</option>
              <option value="FN">FN (Forenoon)</option>
              <option value="AN">AN (Afternoon)</option>
              <option value="night">Night</option>
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="food">Food Timing *</label>
            <select
              id="food"
              name="food"
              value={newPrescription.food}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            >
              <option value="">Select Food Timing</option>
              <option value="before_food">Before Food</option>
              <option value="after_food">After Food</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dosage">Dosage</label>
            <input
              type="text"
              id="dosage"
              name="dosage"
              value={newPrescription.dosage}
              onChange={handleInputChange}
              placeholder="e.g., 1 tablet, 5ml"
              disabled={isLoading}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="instructions">Instructions</label>
            <textarea
              id="instructions"
              name="instructions"
              value={newPrescription.instructions}
              onChange={handleInputChange}
              placeholder="Additional instructions..."
              rows="2"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <button 
              type="submit" 
              className="hospital-btn hospital-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Prescription'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="table-container">
        <h4>Current Prescriptions ({prescriptions.length})</h4>
        {isLoading ? (
          <div className="loading-text">Loading prescriptions...</div>
        ) : (
          <table className="hospital-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Patient Name</th>
                <th>Medicine</th>
                <th>Time</th>
                <th>Food</th>
                <th>Dosage</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((prescription) => (
                <tr key={prescription._id}>
                  <td>{prescription.patientId}</td>
                  <td>{prescription.patientName}</td>
                  <td>{prescription.medicine}</td>
                  <td>{prescription.time}</td>
                  <td>{prescription.food}</td>
                  <td>{prescription.dosage || '-'}</td>
                  <td>{formatDate(prescription.datePrescribed)}</td>
                  <td>
                    <span className={`status-badge status-${prescription.status}`}>
                      {prescription.status}
                    </span>
                  </td>
                </tr>
              ))}
              {prescriptions.length === 0 && (
                <tr>
                  <td colSpan="8" className="no-data">No prescriptions found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PrescriptionManagement;