import React, { useEffect, useState } from 'react';
import './Modal.css';

const Modal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  showCancel = true,
  size = 'medium'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '🎉';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'success':
        return 'Success!';
      case 'error':
        return 'Error!';
      case 'warning':
        return 'Warning!';
      case 'info':
      default:
        return title || 'Information';
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={`modal-overlay ${size}`} onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className={`modal-icon ${type}`}>
          {getIcon()}
        </div>
        
        <h2 className="modal-title">{getTitle()}</h2>
        
        <p className="modal-message">{message}</p>
        
        <div className="modal-actions">
          {showCancel && (
            <button className="modal-btn cancel" onClick={onClose}>
              {cancelText}
            </button>
          )}
          <button 
            className={`modal-btn confirm ${type}`} 
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom hook for modal
export const useModal = () => {
  const [modalProps, setModalProps] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: null,
    showCancel: true,
    size: 'medium'
  });

  const showModal = (props) => {
    setModalProps({ ...modalProps, ...props, isOpen: true });
  };

  const hideModal = () => {
    setModalProps(prev => ({ ...prev, isOpen: false }));
  };

  const ModalComponent = () => (
    <Modal {...modalProps} onClose={hideModal} />
  );

  return {
    showModal,
    hideModal,
    Modal: ModalComponent,
    // Helper methods
    showSuccess: (message, options = {}) => showModal({ type: 'success', message, ...options }),
    showError: (message, options = {}) => showModal({ type: 'error', message, ...options }),
    showWarning: (message, options = {}) => showModal({ type: 'warning', message, ...options }),
    showInfo: (message, options = {}) => showModal({ type: 'info', message, ...options }),
    showConfirm: (message, onConfirm, options = {}) => showModal({ 
      type: 'warning', 
      message, 
      onConfirm,
      confirmText: 'Yes',
      cancelText: 'No',
      ...options 
    }),
  };
};

export default Modal;