import React from 'react';
import { useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import styles from './SignOut.module.css';
import { clearAuthData } from '../../utils/auth';
import {SignOut_clearUser} from '../../services/api';

const SignOut = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSignOut = () => {

    SignOut_clearUser("email")
    // Sign out from Google
    googleLogout();

    // Use the context method to logout
    logout();

    // Clear local storage
    clearAuthData();

    // Redirect to landing page
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