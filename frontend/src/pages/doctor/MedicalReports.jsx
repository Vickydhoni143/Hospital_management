import React, { useState, useEffect } from 'react';
import '../../static/doctor/MedicalReports.css';

const MedicalReports = ({ doctorData }) => {
  const [reports, setReports] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [approvalComments, setApprovalComments] = useState('');

  useEffect(() => {
    fetchMedicalReports();
    fetchPendingReports();
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

  const fetchPendingReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/medical-reports/doctor/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setPendingReports(result.data.pendingReports || []);
      }
    } catch (error) {
      console.error('Error fetching pending reports:', error);
    }
  };

  const handleApproveReport = async (reportId, approved) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/medical-reports/${reportId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          approved,
          comments: approvalComments 
        })
      });

      if (response.ok) {
        const result = await response.json();
        setFeedback({ type: 'success', message: result.message });
        setApprovalComments('');
        setSelectedReport(null);
        fetchMedicalReports();
        fetchPendingReports();
      } else {
        throw new Error('Failed to update report status');
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      setFeedback({ type: 'error', message: 'Failed to update report status' });
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setApprovalComments(report.comments || '');
  };

  const closeModal = () => {
    setSelectedReport(null);
    setApprovalComments('');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', text: 'Pending Approval' },
      approved: { class: 'status-approved', text: 'Approved' },
      rejected: { class: 'status-rejected', text: 'Rejected' },
      archived: { class: 'status-archived', text: 'Archived' }
    };
    
    const config = statusConfig[status] || { class: 'status-pending', text: status };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="medical-reports-section">
      <div className="section-header">
        <h2>Medical Reports</h2>
        <p>Review and approve medical reports for your patients</p>
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

      <div className="reports-tabs">
        <button 
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <i className="fas fa-clock"></i>
          Pending Approval
          {pendingReports.length > 0 && (
            <span className="tab-badge">{pendingReports.length}</span>
          )}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <i className="fas fa-list"></i>
          All Reports
        </button>
      </div>

      <div className="reports-list">
        {activeTab === 'pending' ? (
          <>
            <h3>Reports Pending Your Approval</h3>
            {pendingReports.length === 0 ? (
              <div className="no-data-message">
                <i className="fas fa-check-circle"></i>
                <p>No reports pending approval</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="hospital-table">
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Patient</th>
                      <th>Patient ID</th>
                      <th>Title</th>
                      <th>File</th>
                      <th>Uploaded</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingReports.map(report => (
                      <tr key={report._id}>
                        <td>{report.reportId}</td>
                        <td>{report.patientName}</td>
                        <td>{report.patientIdentifier}</td>
                        <td>{report.title}</td>
                        <td>
                          <div className="file-info">
                            <i className="fas fa-file"></i>
                            <span>{report.fileName}</span>
                            <small>({formatFileSize(report.fileSize)})</small>
                          </div>
                        </td>
                        <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="hospital-btn hospital-btn-info btn-sm"
                              onClick={() => handleViewReport(report)}
                            >
                              <i className="fas fa-eye"></i>
                              Review
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            <h3>All Medical Reports</h3>
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading medical reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="no-data-message">
                <i className="fas fa-file-medical"></i>
                <p>No medical reports found</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="hospital-table">
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Patient</th>
                      <th>Patient ID</th>
                      <th>Title</th>
                      <th>File</th>
                      <th>Status</th>
                      <th>Uploaded</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report._id}>
                        <td>{report.reportId}</td>
                        <td>{report.patientName}</td>
                        <td>{report.patientIdentifier}</td>
                        <td>{report.title}</td>
                        <td>
                          <div className="file-info">
                            <i className="fas fa-file"></i>
                            <span>{report.fileName}</span>
                            <small>({formatFileSize(report.fileSize)})</small>
                          </div>
                        </td>
                        <td>{getStatusBadge(report.status)}</td>
                        <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="hospital-btn hospital-btn-info btn-sm"
                              onClick={() => handleViewReport(report)}
                            >
                              <i className="fas fa-eye"></i>
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Review Report Modal */}
      {selectedReport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Review Medical Report</h3>
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
                  <label>Patient:</label>
                  <span>{selectedReport.patientName}</span>
                </div>
                <div className="detail-row">
                  <label>Patient ID:</label>
                  <span>{selectedReport.patientIdentifier}</span>
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
                  <span>
                    <a 
                      href={`http://localhost:5000${selectedReport.fileUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="file-link"
                    >
                      {selectedReport.fileName} ({formatFileSize(selectedReport.fileSize)})
                    </a>
                  </span>
                </div>
                <div className="detail-row">
                  <label>Admin Comments:</label>
                  <span>{selectedReport.comments || 'No comments from admin'}</span>
                </div>
                <div className="detail-row">
                  <label>Uploaded By:</label>
                  <span>{selectedReport.adminName} (Admin)</span>
                </div>
                <div className="detail-row">
                  <label>Uploaded On:</label>
                  <span>{new Date(selectedReport.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {selectedReport.status === 'pending' && (
                <div className="approval-section">
                  <h4>Your Review Comments</h4>
                  <textarea
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                    placeholder="Enter your comments for the patient..."
                    rows="4"
                    className="approval-comments"
                  />
                  
                  <div className="approval-actions">
                    <button
                      className="hospital-btn hospital-btn-danger"
                      onClick={() => handleApproveReport(selectedReport._id, false)}
                    >
                      <i className="fas fa-times"></i>
                      Reject Report
                    </button>
                    <button
                      className="hospital-btn hospital-btn-success"
                      onClick={() => handleApproveReport(selectedReport._id, true)}
                    >
                      <i className="fas fa-check"></i>
                      Approve Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalReports;