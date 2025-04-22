import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './SignOut.module.css';
import { handleSignOut } from './SignOutHelper';

const SignOut = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  return (
    <div
      className={styles.signoutContainer}
      onClick={() => handleSignOut(logout, navigate, user?.email)}
    >
      <p className={styles.signoutText}>Sign Out</p>
    </div>
  );
};

export default SignOut;
