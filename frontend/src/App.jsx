// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import LoginPage from './pages/LoginPage.jsx';
import PatientDashboard from './pages/patient/PatientDashboard.jsx';
import DoctorDashboard from './pages/doctor/DoctorDashboard.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} /> 
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/about-us" element={<AboutUs />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


