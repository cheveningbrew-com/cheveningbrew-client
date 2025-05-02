import React from 'react';
import styles from './SignoutPopup.module.css';
import { downloadFeedbackPDFs } from '../../utils/downloadFeedback';
import { getUserInterviews, getUserId } from '../../services/api';

const SignOutPopup = ({ isOpen, onConfirm, onCancel }) => {
  const [interviewList, setInterviewList] = React.useState([]);

  // Load interview list when component mounts
  React.useEffect(() => {
    const loadInterviews = async () => {
      if (isOpen) {
        try {
          const userId = getUserId();
          const data = await getUserInterviews(userId);
          setInterviewList(data);
        } catch (err) {
          console.error("Failed to load interview list", err);
        }
      }
    };
    loadInterviews();
  }, [isOpen]);

  const handleDownloadAll = () => {
    if (interviewList.length > 0) {
      downloadFeedbackPDFs(interviewList);
    }
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.popup_overlay} onClick={onCancel}>
      <div className={styles.popup_box} onClick={handleOverlayClick}>
        {/* X cancel button */}
        <button className={styles.close_icon} onClick={onCancel}>
          &times;
        </button>

        <h3>
          To start a new interview, please sign out and sign in again.<br /><br />
          <span style={{ fontWeight: 400, color: '#ffe585' }}>
            Note: All data will be lost when you sign out.
          </span>
        </h3>

        <div className={styles.popup_actions}>
          <button
            className={`${styles.btn} ${styles.confirm}`}
            onClick={onConfirm}
          >
            Yes, Sign Out
          </button>

          {interviewList.length > 0 && (
            <button
              className={`${styles.btn} ${styles.download}`}
              onClick={handleDownloadAll}
            >
              Download Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignOutPopup;