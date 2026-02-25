import React, { useEffect, useState } from 'react';
import './Notification.css';

const Notification = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Match animation duration
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`notification ${type} ${isExiting ? 'exit' : ''}`}>
      <span className="notification-icon">{getIcon()}</span>
      <span className="notification-message">{message}</span>
      <button className="notification-close" onClick={() => {
        setIsExiting(true);
        setTimeout(onClose, 300);
      }}>×</button>
    </div>
  );
};

// Notification Container Component
export const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

// Custom hook for notifications
export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  return {
    notifications,
    showNotification,
    removeNotification,
    success: (msg, duration) => showNotification(msg, 'success', duration),
    error: (msg, duration) => showNotification(msg, 'error', duration),
    warning: (msg, duration) => showNotification(msg, 'warning', duration),
    info: (msg, duration) => showNotification(msg, 'info', duration),
  };
};

export default Notification;