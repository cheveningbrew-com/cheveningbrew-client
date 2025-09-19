import React from 'react';
import styles from './DonationPopup.module.css';

const DonationPopup = ({ isOpen, onCancel, onDonate, documentName }) => {
  if (!isOpen) return null;

  const handleCancel = () => {
    onCancel();
  };

  const handleDonate = () => {
    onDonate();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup_box}>
        <div className={styles.icon}>💝</div>

        <h3 className={styles.title}>Support Our Free Service</h3>

        <div className={styles.message}>
          <p>
            We provide comprehensive essay analysis for free to help students succeed.
            If you find our service valuable, consider making a small donation to help us continue supporting students like you.
          </p>
        </div>

        <div className={styles.benefitsSection}>
          <h4>Your support helps us:</h4>
          <ul>
            <li>✨ Keep the service free for all students</li>
            <li>🚀 Improve our AI analysis capabilities</li>
            <li>📚 Create more educational resources</li>
            <li>🌟 Support students worldwide</li>
          </ul>
        </div>

        <div className={styles.popup_actions}>
          <button
            className={styles.cancelButton}
            onClick={handleCancel}
          >
            Maybe Later
          </button>
          <button
            className={styles.donateButton}
            onClick={handleDonate}
          >
            Support Us ❤️
          </button>
        </div>

        <div className={styles.footnote}>
          <small>Your download will begin regardless of your choice</small>
        </div>
      </div>
    </div>
  );
};

export default DonationPopup;