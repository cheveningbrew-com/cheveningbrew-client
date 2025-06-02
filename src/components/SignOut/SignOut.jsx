import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignOut.module.css';
// import { useAuth } from '../../context/AuthContext';
// import { handleSignOut } from './SignOutHelper';

const SignOut = () => {
  const navigate = useNavigate();
  // const { logout, user } = useAuth();

  return (
    <div
      className={styles.signoutContainer}
      // onClick={() => handleSignOut(logout, navigate, user?.email)}
      onClick={() => {
        // Simple sign out - just clear session storage and redirect
        sessionStorage.clear();
        navigate('/');
      }}
    >
      <p className={styles.signoutText}>Sign Out</p>
    </div>
  );
};

export default SignOut;