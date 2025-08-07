import React, { useEffect, useRef, useState } from 'react';
import styles from './SignoutPopup.module.css';

const SignoutPopup = ({ isOpen, onConfirm, onCancel }) => {
  const [contentPosition, setContentPosition] = useState(null);
  const popupBoxRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      // Find the content container
      const contentContainer = document.querySelector('[class*="contentContainer"]');
      if (contentContainer) {
        // Get position of content container
        const rect = contentContainer.getBoundingClientRect();
        setContentPosition({
          left: rect.left + rect.width / 2,
          top: rect.top + rect.height / 2
        });
      }
    }
  }, [isOpen]);
  
  // Center the popup when position is available
  useEffect(() => {
    if (contentPosition && popupBoxRef.current) {
      const popupWidth = popupBoxRef.current.offsetWidth;
      const popupHeight = popupBoxRef.current.offsetHeight;
      
      popupBoxRef.current.style.position = 'fixed';
      popupBoxRef.current.style.left = `${contentPosition.left - popupWidth / 2}px`;
      popupBoxRef.current.style.top = `${contentPosition.top - popupHeight / 2}px`;
      popupBoxRef.current.style.transform = 'none'; // Remove any transform
    }
  }, [contentPosition]);
  
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    // Close popup if clicking on overlay (background)
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };
  
  return (
    <div className={styles.popup_overlay} onClick={handleOverlayClick}>
      <div className={styles.popup_box} ref={popupBoxRef}>
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