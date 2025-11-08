// src/pages/doctor/DoctorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DoctorProfileManagement from './DoctorProfileManagement';
import DoctorAppointments from './DoctorAppointments';
import PrescriptionManagement from './PrescriptionManagement';
import MedicalReports from './MedicalReports';
import '../../static/common.css';
import '../../static/doctor/DoctorDashboard.css';

const DoctorDashboard = () => {
  const [activeSection, setActiveSection] = useState('appointments');
  const [doctorData, setDoctorData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(user);
      if (userData.role !== 'doctor') {
        navigate('/login');
        return;
      }
      setDoctorData(userData);
    } catch (error) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('roleData');
    navigate('/login');
  };

  const getDisplayName = () => {
    if (!doctorData?.fullName) return '';
    
    let name = doctorData.fullName;
    if (name.startsWith('Dr. Dr. ')) {
      name = name.replace('Dr. Dr. ', 'Dr. ');
    } else if (name.startsWith('Dr. ')) {
      name = name;
    } else {
      name = `Dr. ${name}`;
    }
    
    return name;
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return <DoctorProfileManagement doctorData={doctorData} />;
      case 'appointments':
        return <DoctorAppointments doctorData={doctorData} />;
      case 'prescriptions':
        return <PrescriptionManagement doctorData={doctorData} />;
      case 'medical-reports':
        return <MedicalReports doctorData={doctorData} />;
      default:
        return <DoctorAppointments doctorData={doctorData} />;
    }
  };

  if (!doctorData) {
    return (
      <div className="hospital-app">
        <Header />
        <main className="hospital-main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading Doctor Dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = getDisplayName();

  return (
    <div className="hospital-app">
      <Header onLoginClick={handleLoginClick} />
      
      <main className="hospital-main-content">
        <div className="doctor-dashboard-container">
          <div className="dashboard-header">
            <div className="dashboard-header-content">
              <h1>Doctor Dashboard</h1>
              <p>Welcome back, {displayName}!</p>
            </div>
            <div className="dashboard-actions">
              <button 
                className="hospital-btn hospital-btn-secondary logout-btn"
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="dashboard-sidebar">
              <nav className="sidebar-nav">
                <button 
                  className={`sidebar-btn ${activeSection === 'appointments' ? 'active' : ''}`}
                  onClick={() => setActiveSection('appointments')}
                >
                  <i className="fas fa-calendar-check"></i>
                  My Appointments
                </button>
                <button 
                  className={`sidebar-btn ${activeSection === 'prescriptions' ? 'active' : ''}`}
                  onClick={() => setActiveSection('prescriptions')}
                >
                  <i className="fas fa-file-prescription"></i>
                  Prescriptions
                </button>
                <button 
                  className={`sidebar-btn ${activeSection === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveSection('profile')}
                >
                  <i className="fas fa-user-md"></i>
                  Profile Management
                </button>
                <button 
                className={`sidebar-btn ${activeSection === 'medical-reports' ? 'active' : ''}`}
                onClick={() => setActiveSection('medical-reports')}
              >
                <i className="fas fa-file-medical"></i>
                Medical Reports
              </button>
              </nav>
            </div>

            <div className="dashboard-main">
              {renderActiveSection()}
            </div>
          </div>
        </div>
      </main>

      <Footer onLoginClick={handleLoginClick} />
    </div>
  );
};

export default DoctorDashboard;