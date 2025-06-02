import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignOut.module.css';

const SignOut = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Clear any session storage
    sessionStorage.clear();
    // Navigate to home
    navigate('/');
  };

  return (
    <div
      className={styles.signoutContainer}
      onClick={handleSignOut}
    >
      <p className={styles.signoutText}>Sign Out</p>
    </div>
  );
};

export default SignOut;