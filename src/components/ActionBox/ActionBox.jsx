import React, { useRef } from "react";
import styles from "./ActionBox.module.css";
import { ActionBoxProvider } from "../../context/ActionBoxContext";

const ActionBox = ({ children, className }) => {
  const actionBoxRef = useRef(null);

  return (
    <ActionBoxProvider>
      <div 
        ref={actionBoxRef} 
        className={`${styles.actionBox} ${className || ''}`} 
        style={{ position: 'relative' }}
      >
        {children}
      </div>
    </ActionBoxProvider>
  );
};

export default ActionBox;
