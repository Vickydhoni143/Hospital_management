import React, { useState, useEffect } from 'react';
import BookAppointmentForm from './BookAppointmentForm';
import '../../static/patient/Appointments.css';

const Appointments = ({ patientData }) => {
  const [showBookForm, setShowBookForm] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [feedback, setFeedback] = useState({ message: '', type: '', show: false });
  const [cancelConfirmation, setCancelConfirmation] = useState({ show: false, appointment: null });
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:5000/api';

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/appointments/patient`, {
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
    
    // Set up interval to check for status updates
    const interval = setInterval(fetchAppointments, 5000);
    return () => clearInterval(interval);
  }, []);

  const showFeedbackMessage = (message, type = 'success') => {
    setFeedback({ message, type, show: true });
    setTimeout(() => {
      setFeedback({ message: '', type: '', show: false });
    }, 5000);
  };

  const handleBookAppointment = async (newAppointment) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: newAppointment.doctorId,
          date: newAppointment.date,
          time: newAppointment.time,
          reason: newAppointment.reason
        })
      });

      if (response.ok) {
        setShowBookForm(false);
        showFeedbackMessage('Appointment booked successfully! Waiting for admin approval.', 'success');
        fetchAppointments(); // Refresh the list
      } else {
        const error = await response.json();
        showFeedbackMessage(error.message, 'error');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      showFeedbackMessage('Failed to book appointment', 'error');
    }
  };

  const showCancelConfirmation = (appointment) => {
    setCancelConfirmation({ show: true, appointment });
  };

  const hideCancelConfirmation = () => {
    setCancelConfirmation({ show: false, appointment: null });
  };

  const handleCancelAppointment = async () => {
    if (cancelConfirmation.appointment) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/appointments/${cancelConfirmation.appointment._id}`, {
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
      } finally {
        hideCancelConfirmation();
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-waiting-for-approval';
      case 'Approved':
        return 'status-approved';
      case 'Rejected':
        return 'status-rejected';
      case 'Completed':
        return 'status-completed';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return 'status-waiting-for-approval';
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
        <h2>Appointments</h2>
        <p>Manage your medical appointments</p>
      </div>

      <div className="appointments-actions">
        <button 
          className="hospital-btn hospital-btn-primary"
          onClick={() => setShowBookForm(true)}
        >
          <i className="fas fa-plus"></i>
          Book Appointment
        </button>
        
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

      {showBookForm && (
        <BookAppointmentForm 
          patientData={patientData}
          onSubmit={handleBookAppointment}
          onCancel={() => setShowBookForm(false)}
        />
      )}

      {cancelConfirmation.show && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <div className="confirmation-header">
              <h3>Cancel Appointment</h3>
              <button className="close-btn" onClick={hideCancelConfirmation}>×</button>
            </div>
            <div className="confirmation-body">
              <div className="warning-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <p>Are you sure you want to cancel this appointment?</p>
              <div className="appointment-details">
                <p><strong>Date:</strong> {formatDate(cancelConfirmation.appointment?.date)}</p>
                <p><strong>Time:</strong> {cancelConfirmation.appointment?.time}</p>
                <p><strong>Doctor:</strong> Dr. {cancelConfirmation.appointment?.doctorId?.name}</p>
                <p><strong>Specialization:</strong> {cancelConfirmation.appointment?.doctorId?.specialization}</p>
              </div>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="confirmation-actions">
              <button 
                className="hospital-btn hospital-btn-danger"
                onClick={handleCancelAppointment}
              >
                <i className="fas fa-times"></i>
                Yes, Cancel Appointment
              </button>
              <button 
                className="hospital-btn hospital-btn-secondary"
                onClick={hideCancelConfirmation}
              >
                <i className="fas fa-arrow-left"></i>
                No, Keep Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="appointments-list">
        <h3>Your Appointments</h3>
        {appointments.length === 0 ? (
          <div className="no-appointments">
            <i className="fas fa-calendar-times"></i>
            <p>No appointments booked yet</p>
          </div>
        ) : (
          <div className="appointments-table-container">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Appointment ID</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appointment => (
                  <tr key={appointment._id}>
                    <td>{appointment.appointmentId}</td>
                    <td>{formatDate(appointment.date)}</td>
                    <td>{appointment.time}</td>
                    <td>Dr. {appointment.doctorId?.name}</td>
                    <td>{appointment.doctorId?.specialization}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td>
                      {appointment.status === 'Pending' && (
                        <button 
                          className="hospital-btn hospital-btn-danger hospital-btn-small"
                          onClick={() => showCancelConfirmation(appointment)}
                        >
                          <i className="fas fa-times"></i>
                          Cancel
                        </button>
                      )}
                      {appointment.status === 'Approved' && (
                        <span className="approved-text">
                          <i className="fas fa-check-circle"></i>
                          Confirmed
                        </span>
                      )}
                      {appointment.status === 'Rejected' && (
                        <span className="rejected-text">
                          <i className="fas fa-times-circle"></i>
                          Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;