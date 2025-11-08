


import React, { useState, useEffect } from 'react';

const Prescriptions = ({ patientData }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (patientData?.patientId) {
      fetchPatientPrescriptions();
    }
  }, [patientData]);

  const fetchPatientPrescriptions = async () => {
    try {
      if (!patientData?.patientId) {
        console.error('No patient ID available');
        return;
      }

      setIsLoading(true);
      const token = localStorage.getItem('token');
      const patientId = patientData.patientId;
      
      console.log('Fetching prescriptions for patient:', patientId); // Debug log

      const response = await fetch(`${API_BASE_URL}/prescriptions/patient/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Prescriptions API response:', result); // Debug log
      
      if (result.status === 'success') {
        setPrescriptions(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch prescriptions');
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      alert(`Failed to load prescriptions: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a refresh button for testing
  const handleRefresh = () => {
    fetchPatientPrescriptions();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>My Prescriptions</h2>
        <button 
          onClick={handleRefresh}
          className="refresh-btn"
          style={{
            padding: '8px 16px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
        <p>View your prescribed medications</p>
        <div style={{fontSize: '14px', color: '#666', marginTop: '5px'}}>
          Patient ID: {patientData?.patientId || 'Not available'}
        </div>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading prescriptions...</p>
          </div>
        ) : (
          <>
            <div className="prescription-count">
              <strong>Total Prescriptions: {prescriptions.length}</strong>
            </div>
            
            <table className="hospital-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Time</th>
                  <th>Food Timing</th>
                  <th>Doctor</th>
                  <th>Date Prescribed</th>
                  <th>Instructions</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((prescription) => (
                  <tr key={prescription._id}>
                    <td>
                      <strong>{prescription.medicine}</strong>
                    </td>
                    <td>{prescription.dosage || 'As directed'}</td>
                    <td>
                      <span className="time-badge">{prescription.time}</span>
                    </td>
                    <td>
                      <span className={`food-badge ${prescription.food}`}>
                        {prescription.food.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{prescription.doctorName}</td>
                    <td>{formatDate(prescription.datePrescribed)}</td>
                    <td>
                      {prescription.instructions || 'No special instructions'}
                    </td>
                    <td>
                      <span className={`status-badge status-${prescription.status}`}>
                        {prescription.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {prescriptions.length === 0 && (
                  <tr>
                    <td colSpan="8" className="no-data">
                      No prescriptions found. Your doctor will add prescriptions here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;