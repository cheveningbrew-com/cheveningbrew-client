import React from 'react';
import styles from './SignoutPopup.module.css';
import SignOut from '../SignOut/SignOut';

const SignOutPopup = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    // Prevent click from closing when clicking inside the popup
    e.stopPropagation();
  };

  return (
    <div className={styles.popup_overlay} onClick={onCancel}>
      <div className={styles.popup_box} onClick={handleOverlayClick}>
        <h3>If you want to add a new interview, sign out and then join again.</h3>
        <div className={styles.popup_actions}>
          <button
            className={`${styles.btn} ${styles.confirm}`}
            onClick={onConfirm}
          >
            Yes, Sign Out
          </button>
          <button
            className={`${styles.btn} ${styles.cancel}`}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOutPopup;
