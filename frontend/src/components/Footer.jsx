// src/components/Footer.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../static/common.css';

const Footer = ({  }) => {
  const navigate = useNavigate();
  const hadleLoginClick = () =>
  {
    navigate('/login');
  };
  const handleHomeClick = () => {
    navigate('/');
  };

  const handleAboutClick = () => {
    navigate('/about-us');
  };

  const handleContactClick = () => {
    navigate('/contact-us');
  };

  return (
    <footer className="hospital-footer">
      <div className="hospital-container">
        <div className="hospital-footer-content">
          <div className="hospital-footer-section">
            <div className="hospital-logo">
              <i className="fas fa-hospital"></i>
              <h3>VS Hospital</h3>
            </div>
            <p>Providing quality healthcare with advanced technology and compassionate service.</p>
            <div className="hospital-social-links">
              <a href="#"><i className="fab fa-facebook"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-linkedin"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
          <div className="hospital-footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><button onClick={handleHomeClick}>Home</button></li>
              <li><button onClick={handleAboutClick}>About</button></li>
              <li><button onClick={handleContactClick}>Contact</button></li>
              <li><button onClick={hadleLoginClick}>Login Portal</button></li>
            </ul>
          </div>
          <div className="hospital-footer-section">
            <h4>Contact Us</h4>
            <ul className="hospital-contact-info">
              <li><i className="fas fa-map-marker-alt"></i>Bangalore - Chennai
                      National Highway (NH 48) Vellore - 623 001</li>
              <li><i className="fas fa-phone"></i>7200308286</li>
              <li><i className="fas fa-envelope"></i> info@vshospital.com</li>
            </ul>
          </div>
        </div>
        <div className="hospital-footer-bottom">
          <p>&copy; 2024 VS Hospital. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;