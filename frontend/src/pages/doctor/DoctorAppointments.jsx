import React, { useState, useEffect } from 'react';

const DoctorAppointments = ({ doctorData }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:5000/api';

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/appointments/doctor`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setAppointments(result.data.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchAppointments, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchAppointments(); // Refresh the list
      } else {
        alert('Failed to complete appointment');
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert('Failed to complete appointment');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="appointments-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="appointments-section">
      <div className="section-header">
        <h2>My Appointments</h2>
        <p>Your scheduled appointments</p>
      </div>
      
      <div className="table-container">
        {appointments.length === 0 ? (
          <div className="no-appointments">
            <i className="fas fa-calendar-times"></i>
            <p>No appointments scheduled</p>
          </div>
        ) : (
          <table className="hospital-table">
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Patient Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>{appointment.appointmentId}</td>
                  <td>{appointment.patientId?.userId?.fullName}</td>
                  <td>{formatDate(appointment.date)}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.reason || 'Not specified'}</td>
                  <td>
                    <span className={`status-badge ${
                      appointment.status === 'Approved' ? 'status-approved' : 
                      appointment.status === 'Completed' ? 'status-completed' : ''
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    {appointment.status === 'Approved' && (
                      <button 
                        className="hospital-btn hospital-btn-primary btn-sm"
                        onClick={() => handleCompleteAppointment(appointment._id)}
                      >
                        <i className="fas fa-check"></i>
                        Complete
                      </button>
                    )}
                    {appointment.status === 'Completed' && (
                      <span className="completed-text">
                        <i className="fas fa-check-circle"></i>
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;