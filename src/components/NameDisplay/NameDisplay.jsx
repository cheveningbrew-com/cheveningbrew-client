import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NameDisplay.module.css';

const NameDisplay = ({ userName, isLoading = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isLoading) return; // Prevent click when disabled
    navigate('/profile');
  };

  return (
    <div className={`${styles.nameContainer} ${isLoading ? styles.disabled : ''}`} onClick={handleClick}>
      <p className={styles.welcomeText}>
        <span className={styles.userName}>{userName}</span>
      </p>
    </div>
  );
};

export default NameDisplay;