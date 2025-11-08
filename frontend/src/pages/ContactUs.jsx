import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../static/common.css';
import '../static/ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    department: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your enquiry! We will get back to you soon.');
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      department: '',
      message: ''
    });
  };

  return (
    <div className="hospital-app">
      <Header />
      
      <main className="hospital-main-content">
        <div className="contact-us-container">
          {/* Hero Section with Contact Us */}
          <div className="contact-hero-section">
            <div className="contact-us-badge">
              <span>CONTACT US</span>
            </div>
            <h1 className="hero-title">Experience our dedication to your care</h1>
            <p className="hero-subtitle">get in touch with us</p>
          </div>
          <br />
          <div className="contact-content-vertical">
            {/* Contact Information Section */}
            <section className="contact-info-section">
              <div className="contact-info-cards">
                <div className="contact-card">
                  <div className="card-icon">📍</div>
                  <div className="card-content">
                    <h3 className="card-title">Collector's Office</h3>
                    <p className="card-text">
                      Bangalore - Chennai<br />
                      National Highway (NH 48)<br />
                      Vellore - 623 001
                    </p>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="card-icon">📅</div>
                  <div className="card-content">
                    <h3 className="card-title">Appointments</h3>
                    <p className="card-text">7200308286</p>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="card-icon">📞</div>
                  <div className="card-content">
                    <h3 className="card-title">Other Enquiries</h3>
                    <p className="card-text">9590458920</p>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="card-icon">🚨</div>
                  <div className="card-content">
                    <h3 className="card-title">Emergency</h3>
                    <p className="card-text emergency-number">108</p>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="card-icon">✉️</div>
                  <div className="card-content">
                    <h3 className="card-title">Email</h3>
                    <p className="card-text email">vshospital@gmail.com</p>
                  </div>
                </div>
              </div>
            </section>
            {/* Enquire Now Section
            <section className="enquire-now-section">
              <h2 className="section-title-main">Enquire Now</h2>
              
              <form onSubmit={handleSubmit} className="enquiry-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Department</label>
                    <select 
                      name="department" 
                      value={formData.department}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="cardiology">Cardiology</option>
                      <option value="dermatology">Dermatology</option>
                      <option value="neurology">Neurology</option>
                      <option value="pediatrics">Pediatrics</option>
                      <option value="orthopedics">Orthopedics</option>
                      <option value="emergency">Emergency</option>
                      <option value="general">General Medicine</option>
                    </select>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter your message or enquiry"
                    rows="4"
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">
                  Submit Enquiry
                </button>
              </form>
            </section> */}
          </div>
        </div>
      </main>
      <br />
      <Footer />
    </div>
  );
};

export default ContactUs;