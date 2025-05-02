// Popup.jsx
import React from 'react';
import styles from './Popup.module.css';

const Popup = ({ message, onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.popup_box}>
        <h3>{message}</h3>
        <div className={styles.popup_actions}>
          <button onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
