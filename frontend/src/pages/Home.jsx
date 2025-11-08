import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../static/common.css';
import '../static/home.css';

const Home = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [loginType, setLoginType] = useState('patient');
  const [feedbackFormOpen, setFeedbackFormOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState({ show: false, type: '', text: '' });
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    rating: 5,
    comment: '',
    role: 'visitor'
  });

  const navigate = useNavigate();

  // Fetch approved feedbacks from API
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/feedback/approved');
      const data = await response.json();
      
      if (data.status === 'success') {
        setFeedbacks(data.data.feedbacks);
      } else {
        console.error('Failed to fetch feedbacks:', data.message);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (feedbackMessage.show) {
      const timer = setTimeout(() => {
        setFeedbackMessage({ show: false, type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage.show]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? "star filled" : "star"}>★</span>
    ));
  };

  const showMessage = (type, text) => {
    setFeedbackMessage({ show: true, type, text });
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackForm)
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Show success message on page
        showMessage('success', data.message);
        
        // Reset form and close modal
        setFeedbackForm({ 
          name: '', 
          email: '', 
          rating: 5, 
          comment: '', 
          role: 'visitor' 
        });
        setFeedbackFormOpen(false);
        
        // Refresh feedbacks to show the new one if approved immediately
        fetchFeedbacks();
      } else {
        showMessage('error', 'Error submitting feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showMessage('error', 'Error submitting feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleLoginPortalClick = () => {
    navigate('/login');
  };

  const handleHomeLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="hospital-app">
      <Header />
      
      {/* Feedback Message Display */}
      {feedbackMessage.show && (
        <div className={`hospital-feedback-message hospital-feedback-message-${feedbackMessage.type}`}>
          <div className="hospital-container">
            <div className="hospital-message-content">
              <span className="hospital-message-icon">
                {feedbackMessage.type === 'success' ? '✓' : '⚠'}
              </span>
              <span className="hospital-message-text">{feedbackMessage.text}</span>
              <button 
                className="hospital-message-close"
                onClick={() => setFeedbackMessage({ show: false, type: '', text: '' })}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
      
      <main className="hospital-main-content">
        <section className="hospital-hero">
          <div className="hospital-container">
            <h2>Hospital Management System</h2>
            <p>Streamlining healthcare operations for better patient care</p>
          </div>
        </section>

        <section className="hospital-about-section">
          <div className="hospital-container">
            <h3>About VS Hospital</h3>
            <div className="hospital-about-content">
              <div className="hospital-about-text">
                <p>VS Hospital is a state-of-the-art healthcare facility dedicated to providing exceptional medical services with compassion and innovation.</p>
                <p>With a team of highly skilled medical professionals and advanced diagnostic equipment, we offer comprehensive healthcare services across all major specialties.</p>
              </div>
              <div className="hospital-about-image">
                <i className="fas fa-stethoscope"></i>
              </div>
            </div>
          </div>
        </section>

        <section className="hospital-functionalities">
          <div className="hospital-container">
            <h3>Our Services</h3>
            <div className="hospital-functionality-tabs">
              <div className="hospital-tab-buttons">
                <button className={loginType === 'patient' ? 'hospital-tab-btn active' : 'hospital-tab-btn'} onClick={() => setLoginType('patient')}>
                  Patient Portal
                </button>
                <button className={loginType === 'doctor' ? 'hospital-tab-btn active' : 'hospital-tab-btn'} onClick={() => setLoginType('doctor')}>
                  Doctor Portal
                </button>
              </div>
              
              <div className="hospital-tab-content">
                {loginType === 'patient' ? (
                  <div className="hospital-patient-features">
                    <h4>Patient Functionalities</h4>
                    <div className="hospital-features-grid">
                      <div className="hospital-feature-card">
                        <i className="fas fa-user"></i>
                        <h5>Profile Management</h5>
                        <p>Manage your personal information and medical history</p>
                      </div>
                      <div className="hospital-feature-card">
                        <i className="fas fa-calendar-check"></i>
                        <h5>Appointments</h5>
                        <p>Book, reschedule or cancel appointments with doctors</p>
                      </div>
                      <div className="hospital-feature-card">
                        <i className="fas fa-file-prescription"></i>
                        <h5>Prescriptions</h5>
                        <p>Access your digital prescriptions anytime, anywhere</p>
                      </div>
                      <div className="hospital-feature-card">
                        <i className="fas fa-file-medical"></i>
                        <h5>Medical Reports</h5>
                        <p>View and download your medical test reports</p>
                      </div>
                      
                      {/* <div className="hospital-feature-card hospital-ai-health-check">
                        <i className="fas fa-robot"></i>
                        <h5>AI Health Check</h5>
                        <p>Get preliminary health assessment using AI technology</p>
                      </div> */}
                    </div>
                  </div>
                ) : (
                  <div className="hospital-doctor-features">
                    <h4>Doctor Functionalities</h4>
                    <div className="hospital-features-grid">
                      <div className="hospital-feature-card">
                        <i className="fas fa-user-md"></i>
                        <h5>My Patients</h5>
                        <p>Access and manage your patient list and their records</p>
                      </div>
                      <div className="hospital-feature-card">
                        <i className="fas fa-file-medical"></i>
                        <h5>Medical reports</h5>
                        <p>View and apporve medical reports</p>
                      </div>
                      <div className="hospital-feature-card">
                        <i className="fas fa-id-card"></i>
                        <h5>Profile Management</h5>
                        <p>Update your professional details</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="hospital-feedback-section">
          <div className="hospital-container">
            <div className="hospital-feedback-header">
              <h3>Patient Feedback</h3>
              <button 
                className="hospital-btn hospital-btn-primary"
                onClick={() => setFeedbackFormOpen(true)}
              >
                Share Your Feedback
              </button>
            </div>
            
            {loading ? (
              <div className="hospital-loading">
                <p>Loading feedbacks...</p>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="hospital-no-feedback">
                <p>No feedbacks available yet. Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="hospital-feedbacks-grid">
                {feedbacks.map(feedback => (
                  <div key={feedback._id} className="hospital-feedback-card">
                    <div className="hospital-feedback-header-inner">
                      <div className="hospital-avatar">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="hospital-feedback-info">
                        <h5>{feedback.name}</h5>
                        <span>{feedback.role}</span>
                      </div>
                    </div>
                    <div className="hospital-feedback-rating">
                      {renderStars(feedback.rating)}
                    </div>
                    <p className="hospital-feedback-comment">"{feedback.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {feedbackFormOpen && (
        <div className="hospital-modal-overlay">
          <div className="hospital-modal">
            <div className="hospital-modal-header">
              <h3>Share Your Feedback</h3>
              <button 
                className="hospital-close-btn" 
                onClick={() => setFeedbackFormOpen(false)}
                disabled={submitting}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="hospital-modal-body">
              <form className="hospital-feedback-form" onSubmit={handleFeedbackSubmit}>
                <div className="hospital-form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name"
                    value={feedbackForm.name}
                    onChange={handleFeedbackChange}
                    placeholder="Enter your name" 
                    required 
                    disabled={submitting}
                  />
                </div>
                <div className="hospital-form-group">
                  <label htmlFor="email">Email (Optional)</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    value={feedbackForm.email}
                    onChange={handleFeedbackChange}
                    placeholder="Enter your email" 
                    disabled={submitting}
                  />
                </div>
                <div className="hospital-form-group">
                  <label htmlFor="role">Your Role</label>
                  <select 
                    id="role" 
                    name="role"
                    value={feedbackForm.role}
                    onChange={handleFeedbackChange}
                    disabled={submitting}
                  >
                    <option value="visitor">Visitor</option>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="hospital-form-group">
                  <label htmlFor="rating">Rating *</label>
                  <select 
                    id="rating" 
                    name="rating"
                    value={feedbackForm.rating}
                    onChange={handleFeedbackChange}
                    required
                    disabled={submitting}
                  >
                    <option value="5">5 Stars - Excellent</option>
                    <option value="4">4 Stars - Very Good</option>
                    <option value="3">3 Stars - Good</option>
                    <option value="2">2 Stars - Fair</option>
                    <option value="1">1 Star - Poor</option>
                  </select>
                </div>
                <div className="hospital-form-group">
                  <label htmlFor="comment">Your Feedback *</label>
                  <textarea 
                    id="comment" 
                    name="comment"
                    value={feedbackForm.comment}
                    onChange={handleFeedbackChange}
                    placeholder="Share your experience and suggestions..." 
                    rows="4"
                    required
                    disabled={submitting}
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="hospital-btn hospital-btn-primary" 
                  style={{width: '100%'}}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;