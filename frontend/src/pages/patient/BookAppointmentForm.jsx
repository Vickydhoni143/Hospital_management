import React, { useState, useEffect } from 'react';

const BookAppointmentForm = ({ patientData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    specialization: '',
    doctorName: '',
    doctorId: '',
    reason: ''
  });

  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api';

  // Time slots
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  // Common specializations
  const commonSpecializations = [
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Gynecology',
    'Ophthalmology',
    'Dentistry',
    'Psychiatry',
    'General Medicine'
  ];

  // Use common specializations directly (no API call needed)
  useEffect(() => {
    setSpecializations(commonSpecializations);
  }, []);

  // Fetch doctors when specialization changes
  useEffect(() => {
    const fetchDoctorsBySpecialization = async () => {
      if (!formData.specialization) {
        setAvailableDoctors([]);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        const response = await fetch(
          `${API_BASE_URL}/doctors/specialization/${encodeURIComponent(formData.specialization)}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch doctors');
        }
        
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
          setAvailableDoctors(result.data);
          setFormData(prev => ({ 
            ...prev, 
            doctorName: '', 
            doctorId: '', 
            time: '' 
          }));
        } else {
          setAvailableDoctors([]);
          setError('No doctors found for this specialization');
        }
      } catch (error) {
        console.error('Error fetching doctors by specialization:', error);
        setAvailableDoctors([]);
        setError('Failed to load doctors. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorsBySpecialization();
  }, [formData.specialization]);

  // Set available time slots when doctor is selected
  useEffect(() => {
    if (formData.doctorId) {
      setAvailableTimeSlots(timeSlots);
      setFormData(prev => ({ ...prev, time: '' }));
    }
  }, [formData.doctorId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDoctorSelect = (e) => {
    const selectedIndex = e.target.selectedIndex;
    const selectedOption = e.target.options[selectedIndex];
    const doctorId = selectedOption.getAttribute('data-id');
    const doctorName = selectedOption.getAttribute('data-name');
    
    setFormData(prev => ({
      ...prev,
      doctorId,
      doctorName
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!formData.date || !formData.time || !formData.specialization || !formData.doctorId) {
      setError('Please fill all required fields');
      return;
    }

    // Check if date is in the future
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError('Please select a future date');
      return;
    }

    try {
      setIsLoading(true);
      await onSubmit(formData);
    } catch (error) {
      setError('Failed to book appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get tomorrow's date for min date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="book-appointment-form-overlay">
      <div className="book-appointment-form">
        <div className="form-header">
          <h3>Book New Appointment</h3>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={getTomorrowDate()}
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="specialization">Specialization *</label>
              <select
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              >
                <option value="">Select Specialization</option>
                {specializations.map((spec, index) => (
                  <option key={index} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="doctorName">Doctor *</label>
              <select
                id="doctorName"
                name="doctorName"
                value={formData.doctorName}
                onChange={handleDoctorSelect}
                required
                disabled={!formData.specialization || isLoading || availableDoctors.length === 0}
              >
                <option value="">Select Doctor</option>
                {availableDoctors.map(doctor => (
                  <option 
                    key={doctor._id} 
                    value={doctor.name}
                    data-id={doctor._id}
                    data-name={doctor.name}
                  >
                    Dr. {doctor.name} - {doctor.specialization} 
                    {doctor.shift && ` (${doctor.shift} Shift)`}
                  </option>
                ))}
              </select>
              {isLoading && formData.specialization && (
                <div className="loading-text">Loading doctors...</div>
              )}
              {!isLoading && formData.specialization && availableDoctors.length === 0 && (
                <div className="no-doctors-text">No doctors available for this specialization</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="time">Time Slot *</label>
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
                disabled={!formData.doctorId || isLoading}
              >
                <option value="">Select Time</option>
                {availableTimeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason for Visit</label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              placeholder="Briefly describe the reason for your visit"
              rows="3"
              disabled={isLoading}
            />
          </div>

          <div className="form-patient-info">
            <h4>Patient Information</h4>
            <div className="patient-details">
              <p><strong>Name:</strong> {patientData?.fullName || 'Not available'}</p>
              <p><strong>Patient ID:</strong> {patientData?.patientId || 'Not available'}</p>
              <p><strong>Email:</strong> {patientData?.email || 'Not available'}</p>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="hospital-btn hospital-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Booking...
                </>
              ) : (
                'Book Appointment'
              )}
            </button>
            <button 
              type="button" 
              className="hospital-btn hospital-btn-secondary" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointmentForm;