import React, { useState, useEffect } from 'react';
import './Popup.css';

const Popup = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div className={`popup-overlay ${type}`}>
      <div className="popup-content">
        <div className="popup-message">
          {type === 'success' && '✅ '}
          {type === 'error' && '❌ '}
          {type === 'info' && 'ℹ️ '}
          {message}
        </div>
        <button className="popup-close" onClick={handleClose}>×</button>
      </div>
    </div>
  );
};

export default Popup;