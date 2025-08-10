import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../SignOut/SignOut.module.css';  // Reuse SignOut styles

const SignIn = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Don't render anything if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleSignInClick = () => {
    navigate('/', { replace: true });
  };

  return (
    <div
      className={styles.signoutContainer}  // Reuse the SignOut container style
      onClick={handleSignInClick}
    >
      <p className={styles.signoutText}>Sign In</p>  {/* Reuse the SignOut text style */}
    </div>
  );
};

export default SignIn;
