import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './SignOut.module.css';
import { handleSignOut } from './SignOutHelper';
import SignoutPopup from '../SignoutPopup/SignoutPopup';

const SignOut = () => {
  const navigate = useNavigate();
  const { logout, user, isAuthenticated } = useAuth();
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // Don't render anything if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleSignOutClick = () => {
    // Show confirmation popup instead of signing out immediately
    setShowConfirmPopup(true);
  };

  const handleConfirmSignOut = () => {
    // User confirmed, proceed with sign out
    setShowConfirmPopup(false);
    handleSignOut(logout, navigate, user?.email);
  };

  const handleCancelSignOut = () => {
    // User canceled, just close the popup
    setShowConfirmPopup(false);
  };

  return (
    <>
      <div
        className={styles.signoutContainer}
        onClick={handleSignOutClick}
      >
        <p className={styles.signoutText}>Sign Out</p>
      </div>

      {showConfirmPopup && (
        <SignoutPopup
          isOpen={showConfirmPopup}
          onConfirm={handleConfirmSignOut}
          onCancel={handleCancelSignOut}
        />
      )}
    </>
  );
};

export default SignOut;