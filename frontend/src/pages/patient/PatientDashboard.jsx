// src/pages/patient/PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProfileManagement from './ProfileManagement';
import Appointments from './Appointments';
import Prescriptions from './Prescriptions';
import MedicalReports from './MedicalReports';
import '../../static/common.css';
import '../../static/patient/PatientDashboard.css';

const PatientDashboard = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!user || !token) {
        navigate('/login');
        return;
      }

      try {
        const userData = JSON.parse(user);
        if (userData.role !== 'patient') {
          navigate('/login');
          return;
        }

        // Fetch complete patient data including patientId
        const response = await fetch('http://localhost:5000/api/patients/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch patient data');
        }

        const result = await response.json();
        
        if (result.status === 'success') {
          setPatientData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch patient data');
        }

      } catch (error) {
        console.error('Error fetching patient data:', error);
        // Fallback: use user data only
        const userData = JSON.parse(localStorage.getItem('user'));
        setPatientData(userData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
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

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileManagement patientData={patientData} />;
      case 'appointments':
        return <Appointments patientData={patientData} />;
      case 'prescriptions':
        return <Prescriptions patientData={patientData} />;
      case 'medical-reports':
        return <MedicalReports patientData={patientData} />;
      default:
        return <ProfileManagement patientData={patientData} />;
    }
  };

  if (isLoading) {
    return (
      <div className="hospital-app">
        <Header />
        <main className="hospital-main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading Patient Dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="hospital-app">
        <Header />
        <main className="hospital-main-content">
          <div className="error-container">
            <h2>Error Loading Patient Data</h2>
            <p>Please try logging in again.</p>
            <button 
              className="hospital-btn hospital-btn-primary"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="hospital-app">
      <Header onLoginClick={handleLoginClick} />
      
      <main className="hospital-main-content">
        <div className="patient-dashboard-container">
          <div className="dashboard-header">
            <div className="dashboard-header-content">
              <h1>Patient Dashboard</h1>
              <p>Welcome back, {patientData.fullName}!</p>
              {patientData.patientId && (
                <p style={{fontSize: '14px', color: '#666'}}>
                  Patient ID: {patientData.patientId}
                </p>
              )}
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
                  className={`sidebar-btn ${activeSection === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveSection('profile')}
                >
                  <i className="fas fa-user"></i>
                  Profile Management
                </button>
                <button 
                  className={`sidebar-btn ${activeSection === 'appointments' ? 'active' : ''}`}
                  onClick={() => setActiveSection('appointments')}
                >
                  <i className="fas fa-calendar-check"></i>
                  Appointments
                </button>
                <button 
                  className={`sidebar-btn ${activeSection === 'prescriptions' ? 'active' : ''}`}
                  onClick={() => setActiveSection('prescriptions')}
                >
                  <i className="fas fa-file-prescription"></i>
                  Prescriptions
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

export default PatientDashboard;