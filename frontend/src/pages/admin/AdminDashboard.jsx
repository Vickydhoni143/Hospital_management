// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import AdminProfileManagement from './AdminProfileManagement';
import ManageDoctors from './ManageDoctors';
import ManagePatients from './ManagePatients';
import ManageAppointments from './ManageAppointments';
import '../../static/common.css';
import '../../static/admin/AdminDashboard.css';
import MedicalReports from './MedicalReports';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('manage-appointments');
  const [adminData, setAdminData] = useState(null);
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
      if (userData.role !== 'admin') {
        navigate('/login');
        return;
      }
      setAdminData(userData);
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

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return <AdminProfileManagement adminData={adminData} />;
      case 'manage-doctors':
        return <ManageDoctors adminData={adminData} />;
      case 'manage-patients':
        return <ManagePatients adminData={adminData} />;
      case 'manage-appointments':
        return <ManageAppointments adminData={adminData} />;
      case 'medical-reports':
        return <MedicalReports adminData={adminData} />;
      default:
        return <ManageAppointments adminData={adminData} />;
    }
  };

  if (!adminData) {
    return (
      <div className="hospital-app">
        <Header />
        <main className="hospital-main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading Admin Dashboard...</p>
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
        <div className="admin-dashboard-container">
          <div className="dashboard-header">
            <div className="dashboard-header-content">
              <h1>Admin Dashboard</h1>
              <p>Welcome back, {adminData.fullName}!</p>
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
                  className={`sidebar-btn ${activeSection === 'manage-appointments' ? 'active' : ''}`}
                  onClick={() => setActiveSection('manage-appointments')}
                >
                  <i className="fas fa-calendar-check"></i>
                  Manage Appointments
                </button>
                <button 
                  className={`sidebar-btn ${activeSection === 'manage-doctors' ? 'active' : ''}`}
                  onClick={() => setActiveSection('manage-doctors')}
                >
                  <i className="fas fa-user-md"></i>
                  Manage Doctors
                </button>
                <button 
                  className={`sidebar-btn ${activeSection === 'manage-patients' ? 'active' : ''}`}
                  onClick={() => setActiveSection('manage-patients')}
                >
                  <i className="fas fa-users"></i>
                  Manage Patients
                </button>
                <button 
                  className={`sidebar-btn ${activeSection === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveSection('profile')}
                >
                  <i className="fas fa-user-cog"></i>
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

export default AdminDashboard;