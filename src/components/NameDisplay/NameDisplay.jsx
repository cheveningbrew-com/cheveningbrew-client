import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NameDisplay.module.css';

const NameDisplay = ({ userName }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/profile');
  };

  return (
    <div className={styles.nameContainer} onClick={handleClick}>
      <p className={styles.welcomeText}>
        <span className={styles.userName}>{userName}</span>
      </p>
    </div>
  );
};

export default NameDisplay;