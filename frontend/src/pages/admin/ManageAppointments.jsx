import React, { useState, useEffect } from 'react';

const ManageAppointments = ({ adminData }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [feedback, setFeedback] = useState({ message: '', type: '', show: false });

  const API_BASE_URL = 'http://localhost:5000/api';

  const showFeedbackMessage = (message, type = 'success') => {
    setFeedback({ message, type, show: true });
    setTimeout(() => {
      setFeedback({ message: '', type: '', show: false });
    }, 5000);
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = filter === 'all' 
        ? `${API_BASE_URL}/appointments/admin`
        : `${API_BASE_URL}/appointments/admin?status=${filter}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setAppointments(result.data.appointments);
      } else {
        console.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      showFeedbackMessage('Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const handleStatusUpdate = async (appointmentId, status, notes = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          notes
        })
      });

      if (response.ok) {
        showFeedbackMessage(`Appointment ${status.toLowerCase()} successfully!`, 'success');
        fetchAppointments(); // Refresh the list
      } else {
        const error = await response.json();
        showFeedbackMessage(error.message, 'error');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      showFeedbackMessage('Failed to update appointment status', 'error');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          showFeedbackMessage('Appointment cancelled successfully!', 'success');
          fetchAppointments(); // Refresh the list
        } else {
          const error = await response.json();
          showFeedbackMessage(error.message, 'error');
        }
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        showFeedbackMessage('Failed to cancel appointment', 'error');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Approved':
        return 'status-confirmed';
      case 'Rejected':
        return 'status-cancelled';
      case 'Completed':
        return 'status-completed';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const getStatusActions = (appointment) => {
    switch (appointment.status) {
      case 'Pending':
        return (
          <div className="action-buttons">
            <button 
              className="hospital-btn hospital-btn-primary btn-sm"
              onClick={() => handleStatusUpdate(appointment._id, 'Approved')}
            >
              <i className="fas fa-check"></i>
              Approve
            </button>
            <button 
              className="hospital-btn hospital-btn-danger btn-sm"
              onClick={() => handleStatusUpdate(appointment._id, 'Rejected')}
            >
              <i className="fas fa-times"></i>
              Reject
            </button>
            
          </div>
        );
      case 'Approved':
        return (
          <div className="action-buttons">
            <button 
              className="hospital-btn hospital-btn-success btn-sm"
              onClick={() => handleStatusUpdate(appointment._id, 'Completed')}
            >
              <i className="fas fa-check-double"></i>
              Complete
            </button>
            
          </div>
        );
      default:
        return (
          <span className="action-completed">
            {appointment.status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="management-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Manage Appointments</h2>
        <p>Review and manage appointment requests from patients</p>
      </div>

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

      <div className="search-filter-section">
        <div className="filter-dropdown">
          <select 
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Appointments</option>
            <option value="Pending">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>
      
      <div className="table-container">
        {appointments.length === 0 ? (
          <div className="no-data-message">
            <i className="fas fa-calendar-times"></i>
            <p>No appointments found</p>
          </div>
        ) : (
          <table className="patients-table">
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Patient Name</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appointment => (
                <tr key={appointment._id}>
                  <td>{appointment.appointmentId}</td>
                  <td>{appointment.patientId?.userId?.fullName}</td>
                  <td>Dr. {appointment.doctorId?.name}</td>
                  <td>{formatDate(appointment.date)}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.reason || 'Not specified'}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    {getStatusActions(appointment)}
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

export default ManageAppointments;