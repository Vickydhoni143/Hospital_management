import React, { useState, useEffect } from 'react';
import '../../static/patient/MedicalReports.css';

const MedicalReports = ({ patientData }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchMedicalReports();
  }, []);

  const fetchMedicalReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/medical-reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setReports(result.data.medicalReports || []);
      } else {
        throw new Error('Failed to fetch medical reports');
      }
    } catch (error) {
      console.error('Error fetching medical reports:', error);
      setFeedback({ type: 'error', message: 'Failed to load medical reports' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  const closeModal = () => {
    setSelectedReport(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="medical-reports-section">
      <div className="section-header">
        <h2>My Medical Reports</h2>
        <p>View your approved medical reports and test results</p>
      </div>

      {feedback.message && (
        <div className={`feedback-message ${feedback.type}`}>
          <div className="feedback-content">
            <i className={`fas ${feedback.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            <span>{feedback.message}</span>
          </div>
          <button 
            className="feedback-close"
            onClick={() => setFeedback({ type: '', message: '' })}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="reports-list">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading medical reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="no-data-message">
            <i className="fas fa-file-medical"></i>
            <h3>No Medical Reports Available</h3>
            <p>You don't have any approved medical reports yet. Reports will appear here once they are reviewed and approved by your doctor.</p>
          </div>
        ) : (
          <div className="reports-grid">
            {reports.map(report => (
              <div key={report._id} className="report-card">
                <div className="report-header">
                  <div className="report-title">
                    <h4>{report.title}</h4>
                    <span className="status-approved">Approved</span>
                  </div>
                  <div className="report-meta">
                    <span className="report-id">ID: {report.reportId}</span>
                    <span className="report-date">
                      Approved: {new Date(report.approvedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="report-body">
                  <p className="report-description">
                    {report.description || 'No description provided'}
                  </p>
                  
                  <div className="report-file">
                    <i className="fas fa-file"></i>
                    <div className="file-info">
                      <span className="file-name">{report.fileName}</span>
                      <span className="file-size">({formatFileSize(report.fileSize)})</span>
                    </div>
                  </div>

                  {report.comments && (
                    <div className="report-comments">
                      <strong>Doctor's Comments:</strong>
                      <p>{report.comments}</p>
                    </div>
                  )}

                  <div className="report-provider">
                    <small>
                      Reviewed and approved by: Dr. {report.doctorName}
                    </small>
                  </div>
                </div>

                <div className="report-actions">
                  <button
                    className="hospital-btn hospital-btn-info"
                    onClick={() => handleViewReport(report)}
                  >
                    <i className="fas fa-eye"></i>
                    View Details
                  </button>
                  <a
                    href={`http://localhost:5000${report.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hospital-btn hospital-btn-primary"
                  >
                    <i className="fas fa-download"></i>
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Report Modal */}
      {selectedReport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Medical Report Details</h3>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="report-details">
                <div className="detail-row">
                  <label>Report ID:</label>
                  <span>{selectedReport.reportId}</span>
                </div>
                <div className="detail-row">
                  <label>Title:</label>
                  <span>{selectedReport.title}</span>
                </div>
                <div className="detail-row">
                  <label>Description:</label>
                  <span>{selectedReport.description || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <label>File:</label>
                  <span>{selectedReport.fileName} ({formatFileSize(selectedReport.fileSize)})</span>
                </div>
                <div className="detail-row">
                  <label>File Type:</label>
                  <span>{selectedReport.fileType}</span>
                </div>
                <div className="detail-row">
                  <label>Doctor's Comments:</label>
                  <span>{selectedReport.comments || 'No comments provided'}</span>
                </div>
                <div className="detail-row">
                  <label>Approved By:</label>
                  <span>Dr. {selectedReport.doctorName}</span>
                </div>
                <div className="detail-row">
                  <label>Approved On:</label>
                  <span>{new Date(selectedReport.approvedAt).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <label>Uploaded On:</label>
                  <span>{new Date(selectedReport.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="modal-actions">
                <a
                  href={`http://localhost:5000${selectedReport.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hospital-btn hospital-btn-primary"
                >
                  <i className="fas fa-download"></i>
                  Download Report
                </a>
                <button
                  className="hospital-btn hospital-btn-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalReports;