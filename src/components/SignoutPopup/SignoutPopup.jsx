import React from 'react';
import styles from './SignoutPopup.module.css';

const SignoutPopup = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    // Close popup if clicking on overlay (background)
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className={styles.popup_overlay} onClick={handleOverlayClick}>
      <div className={styles.popup_box}>
        {/* X close button */}
        <button className={styles.close_icon} onClick={onCancel}>
          &times;
        </button>

        <h3>Sign Out</h3>
        
        <p>Are you sure you want to sign out?</p>
        
        <div className={styles.popup_actions}>
          <button
            className={`${styles.btn} ${styles.cancel}`}
            onClick={onCancel}
          >
            Cancel
          </button>
          
          <button
            className={`${styles.btn} ${styles.confirm}`}
            onClick={onConfirm}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignoutPopup;