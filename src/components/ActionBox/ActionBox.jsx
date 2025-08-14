import React, { useRef } from "react";
import { useLocation } from "react-router-dom";
import styles from "./ActionBox.module.css";
import { ActionBoxProvider } from "../../context/ActionBoxContext";

const ActionBox = ({ children, className }) => {
  const actionBoxRef = useRef(null);
  const location = useLocation();
  const isUploadOrFeedback = location?.pathname?.startsWith("/upload") || location?.pathname?.startsWith("/feedback");

  return (
    <ActionBoxProvider>
      <div 
        ref={actionBoxRef} 
        className={`${styles.actionBox} ${className || ''}`} 
        style={{ position: 'relative' }}
      >

        {isUploadOrFeedback ? (
          <div className={styles.announcement}>
            <h1>
              Our essay reviewer portal opens on <span className={styles["highlight-date"]}>August 18, 2025.</span> Please check back later.
            </h1>
            {/* Children are intentionally hidden for /upload and /feedback routes as per requirement */}
          </div>
        ) : (
          children
        )}
      </div>
    </ActionBoxProvider>
  );
};

export default ActionBox;
