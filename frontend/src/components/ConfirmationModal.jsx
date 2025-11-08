// src/components/ConfirmationModal.jsx
import React from 'react';
import '../static/ConfirmationModal.css';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="confirmation-modal">
        <div className="modal-header">
          <div className={`modal-icon ${type}`}>
            {type === 'danger' ? '🗑️' : '⚠️'}
          </div>
          <h3>{title}</h3>
        </div>
        
        <div className="modal-body">
          <p>{message}</p>
        </div>
        
        <div className="modal-footer">
          <button 
            className="modal-btn modal-btn-cancel"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className={`modal-btn modal-btn-confirm ${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;