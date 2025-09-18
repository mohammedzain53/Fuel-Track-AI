// frontend/src/components/NotificationToast.js
import React, { useState, useEffect } from 'react';

export default function NotificationToast({ message, type = 'info', show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getColorClass = () => {
    switch (type) {
      case 'success': return 'bg-success';
      case 'error': return 'bg-danger';
      case 'warning': return 'bg-warning';
      default: return 'bg-info';
    }
  };

  return (
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
      <div className={`toast show ${getColorClass()} text-white`} role="alert">
        <div className="toast-header">
          <span className="me-2">{getIcon()}</span>
          <strong className="me-auto">Fuel Track AI</strong>
          <button 
            type="button" 
            className="btn-close btn-close-white" 
            onClick={onClose}
          ></button>
        </div>
        <div className="toast-body">
          {message}
        </div>
      </div>
    </div>
  );
}