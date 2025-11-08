// src/components/Header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../static/common.css';

const Header = ({ }) => {
  const navigate = useNavigate();

  const hadleLoginClick = () =>
  {
    navigate('/login');
  };
  const handleHomeClick = () => {
    navigate('/');
  };

  const handleAboutClick = () => {
    // Navigate to about page or scroll to about section
    navigate('/about-us');
    // You can add scroll to about section logic here
  };

  const handleContactClick = () => {
    // Navigate to contact page or scroll to contact section
    navigate('/contact-us');
    // You can add scroll to contact section logic here
  };

  return (
    <header className="hospital-header">
      <div className="hospital-container">
        <div className="hospital-logo" onClick={handleHomeClick}>
          <i className="fas fa-hospital"></i>
          <h1>VS Hospital</h1>
        </div>
        <nav className="hospital-nav">
          <button className="hospital-nav-btn" onClick={handleHomeClick}>Home</button>
          <button className="hospital-nav-btn" onClick={handleAboutClick}>About</button>
          <button className="hospital-nav-btn" onClick={handleContactClick}>Contact</button>
          <button className="hospital-login-btn" onClick={hadleLoginClick}>
            Login Portal
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;