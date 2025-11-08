import React, { useState, useEffect } from 'react';
import '../../static/admin/MedicalReports.css';

const MedicalReports = ({ adminData }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [patientInfo, setPatientInfo] = useState(null);
  const [searchingPatient, setSearchingPatient] = useState(false);
  const [fileError, setFileError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    patientIdentifier: '',
    title: '',
    description: '',
    comments: '',
    file: null
  });

  useEffect(() => {
    fetchMedicalReports();
  }, []);

  const fetchMedicalReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/medical-reports', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setReports(result.data.medicalReports || []);
        setFeedback({ type: '', message: '' });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch medical reports');
      }
    } catch (error) {
      console.error('Error fetching medical reports:', error);
      setFeedback({ type: 'error', message: error.message || 'Failed to load medical reports' });
    } finally {
      setLoading(false);
    }
  };

  const searchPatient = async (patientId) => {
    if (!patientId.trim()) {
      setPatientInfo(null);
      setFeedback({ type: '', message: '' });
      return;
    }

    setSearchingPatient(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/medical-reports/patient/search/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setPatientInfo(result.data);
        setFeedback({ type: 'success', message: `Patient found: ${result.data.fullName}` });
      } else {
        const error = await response.json();
        setPatientInfo(null);
        setFeedback({ type: 'error', message: error.message || 'Patient not found with this ID' });
      }
    } catch (error) {
      console.error('Error searching patient:', error);
      setPatientInfo(null);
      setFeedback({ type: 'error', message: 'Error searching for patient. Please check your connection.' });
    } finally {
      setSearchingPatient(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-search when patient ID changes
    if (name === 'patientIdentifier') {
      if (value.trim().length >= 2) {
        searchPatient(value);
      } else {
        setPatientInfo(null);
        if (value.trim().length === 0) {
          setFeedback({ type: '', message: '' });
        }
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setFileError('File size must be less than 10MB');
        e.target.value = '';
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setFileError('Invalid file type. Please upload PDF, JPEG, PNG, or Word documents.');
        e.target.value = '';
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.file) {
      setFeedback({ type: 'error', message: 'Please select a file to upload' });
      return;
    }

    if (!formData.patientIdentifier.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a Patient ID' });
      return;
    }

    if (!formData.title.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a report title' });
      return;
    }

    if (!patientInfo) {
      setFeedback({ type: 'error', message: 'Please enter a valid Patient ID' });
      return;
    }

    if (fileError) {
      setFeedback({ type: 'error', message: fileError });
      return;
    }

    setUploading(true);
    setFeedback({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.file);
      uploadFormData.append('patientIdentifier', formData.patientIdentifier.trim());
      uploadFormData.append('title', formData.title.trim());
      uploadFormData.append('description', formData.description.trim());
      uploadFormData.append('comments', formData.comments.trim());

      console.log('Uploading medical report...', {
        patientIdentifier: formData.patientIdentifier,
        title: formData.title,
        file: formData.file.name
      });

      const response = await fetch('http://localhost:5000/api/medical-reports/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - let browser set it with boundary
        },
        body: uploadFormData
      });

      const result = await response.json();
      console.log('Upload response:', result);

      if (response.ok) {
        setFeedback({ type: 'success', message: result.message });
        
        // Reset form
        setFormData({
          patientIdentifier: '',
          title: '',
          description: '',
          comments: '',
          file: null
        });
        setPatientInfo(null);
        setFileError('');
        
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        
        setShowUploadForm(false);
        fetchMedicalReports(); // Refresh the list
      } else {
        throw new Error(result.message || `Upload failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error uploading report:', error);
      setFeedback({ 
        type: 'error', 
        message: error.message || 'Failed to upload medical report. Please try again.' 
      });
    } finally {
      setUploading(false);
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

  const resetForm = () => {
    setFormData({
      patientIdentifier: '',
      title: '',
      description: '',
      comments: '',
      file: null
    });
    setPatientInfo(null);
    setFileError('');
    setFeedback({ type: '', message: '' });
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const downloadReport = (report) => {
    window.open(`http://localhost:5000${report.fileUrl}`, '_blank');
  };

  return (
    <div className="medical-reports-section">
      <div className="section-header">
        <h2>Medical Reports Management</h2>
        <p>Upload medical reports for patients. Reports will be sent to their assigned doctor for approval.</p>
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

      <div className="reports-actions">
        <button 
          className="hospital-btn hospital-btn-primary"
          onClick={() => {
            setShowUploadForm(!showUploadForm);
            if (showUploadForm) {
              resetForm();
            }
          }}
        >
          <i className={`fas ${showUploadForm ? 'fa-times' : 'fa-upload'}`}></i>
          {showUploadForm ? 'Cancel Upload' : 'Upload New Report'}
        </button>
        
        <button 
          className="hospital-btn"
          onClick={fetchMedicalReports}
          disabled={loading}
        >
          <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync'}`}></i>
          Refresh
        </button>
      </div>

      {showUploadForm && (
        <div className="upload-form-container">
          <h3>Upload Medical Report</h3>
          <form onSubmit={handleUploadReport} className="report-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Patient ID *</label>
                <input
                  type="text"
                  name="patientIdentifier"
                  value={formData.patientIdentifier}
                  onChange={handleInputChange}
                  placeholder="Enter Patient ID (e.g., PAT001)"
                  required
                  disabled={uploading}
                />
                {searchingPatient && (
                  <div className="searching-indicator">
                    <i className="fas fa-spinner fa-spin"></i>
                    Searching for patient...
                  </div>
                )}
                {patientInfo && !searchingPatient && (
                  <div className="patient-found">
                    <i className="fas fa-check-circle"></i>
                    <strong>Patient Found:</strong> {patientInfo.fullName}
                    <br />
                    <small>ID: {patientInfo.patientId} | Phone: {patientInfo.phoneNumber}</small>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Report Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter report title"
                  required
                  disabled={uploading}
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter report description"
                  rows="3"
                  disabled={uploading}
                />
              </div>

              <div className="form-group full-width">
                <label>Comments for Doctor</label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  placeholder="Enter comments for the doctor's review"
                  rows="3"
                  disabled={uploading}
                />
              </div>

              <div className="form-group full-width">
                <label>Medical Report File *</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  required
                  disabled={uploading}
                />
                {fileError && (
                  <div className="file-error">
                    <i className="fas fa-exclamation-triangle"></i>
                    {fileError}
                  </div>
                )}
                <small>
                  Supported formats: PDF, JPG, PNG, DOC, DOCX (Max: 10MB)
                  {formData.file && (
                    <span className="file-selected">
                      <i className="fas fa-check"></i>
                      Selected: {formData.file.name} ({formatFileSize(formData.file.size)})
                    </span>
                  )}
                </small>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="hospital-btn"
                onClick={resetForm}
                disabled={uploading}
              >
                <i className="fas fa-undo"></i>
                Clear Form
              </button>
              <button
                type="submit"
                className="hospital-btn hospital-btn-primary"
                disabled={uploading || !patientInfo || !formData.file || !formData.title.trim()}
              >
                {uploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload"></i>
                    Upload Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="reports-list">
        <div className="list-header">
          <h3>Medical Reports</h3>
          <div className="list-stats">
            <span className="stat-total">Total: {reports.length}</span>
            <span className="stat-pending">
              Pending: {reports.filter(r => r.status === 'pending').length}
            </span>
            <span className="stat-approved">
              Approved: {reports.filter(r => r.status === 'approved').length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading medical reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="no-data-message">
            <i className="fas fa-file-medical"></i>
            <h3>No Medical Reports</h3>
            <p>No medical reports have been uploaded yet.</p>
            <button 
              className="hospital-btn hospital-btn-primary"
              onClick={() => setShowUploadForm(true)}
            >
              <i className="fas fa-upload"></i>
              Upload First Report
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="hospital-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Patient</th>
                  <th>Patient ID</th>
                  <th>Assigned Doctor</th>
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
                    <td className="report-id">{report.reportId}</td>
                    <td className="patient-name">{report.patientName}</td>
                    <td className="patient-id">{report.patientIdentifier}</td>
                    <td className="doctor-name">{report.doctorName || 'Not Assigned'}</td>
                    <td className="report-title">{report.title}</td>
                    <td className="file-info">
                      <div className="file-display">
                        <i className={`fas ${
                          report.fileType.includes('pdf') ? 'fa-file-pdf' :
                          report.fileType.includes('image') ? 'fa-file-image' :
                          report.fileType.includes('word') ? 'fa-file-word' :
                          'fa-file'
                        }`}></i>
                        <div className="file-details">
                          <span className="file-name">{report.fileName}</span>
                          <span className="file-size">{formatFileSize(report.fileSize)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="status-cell">{getStatusBadge(report.status)}</td>
                    <td className="upload-date">
                      {new Date(report.createdAt).toLocaleDateString()}
                      <br />
                      <small>{new Date(report.createdAt).toLocaleTimeString()}</small>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="hospital-btn hospital-btn-info btn-sm"
                          onClick={() => handleViewReport(report)}
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                          View
                        </button>
                        <button
                          className="hospital-btn hospital-btn-primary btn-sm"
                          onClick={() => downloadReport(report)}
                          title="Download File"
                        >
                          <i className="fas fa-download"></i>
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Report Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Medical Report Details</h3>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="report-details">
                <div className="detail-group">
                  <h4>Report Information</h4>
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
                    <span>{selectedReport.description || 'No description provided'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Status:</label>
                    <span>{getStatusBadge(selectedReport.status)}</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h4>Patient Information</h4>
                  <div className="detail-row">
                    <label>Patient Name:</label>
                    <span>{selectedReport.patientName}</span>
                  </div>
                  <div className="detail-row">
                    <label>Patient ID:</label>
                    <span>{selectedReport.patientIdentifier}</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h4>Medical Professional</h4>
                  <div className="detail-row">
                    <label>Assigned Doctor:</label>
                    <span>{selectedReport.doctorName || 'Not Assigned'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Uploaded By:</label>
                    <span>{selectedReport.adminName || selectedReport.doctorName} ({selectedReport.uploadedBy})</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h4>File Information</h4>
                  <div className="detail-row">
                    <label>File Name:</label>
                    <span>{selectedReport.fileName}</span>
                  </div>
                  <div className="detail-row">
                    <label>File Type:</label>
                    <span>{selectedReport.fileType}</span>
                  </div>
                  <div className="detail-row">
                    <label>File Size:</label>
                    <span>{formatFileSize(selectedReport.fileSize)}</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h4>Comments</h4>
                  <div className="detail-row full-width">
                    <label>Admin Comments:</label>
                    <span>{selectedReport.comments || 'No comments provided'}</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h4>Timeline</h4>
                  <div className="detail-row">
                    <label>Uploaded On:</label>
                    <span>{new Date(selectedReport.createdAt).toLocaleString()}</span>
                  </div>
                  {selectedReport.approvedAt && (
                    <div className="detail-row">
                      <label>Approved On:</label>
                      <span>{new Date(selectedReport.approvedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button
                  className="hospital-btn hospital-btn-primary"
                  onClick={() => downloadReport(selectedReport)}
                >
                  <i className="fas fa-download"></i>
                  Download Report
                </button>
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