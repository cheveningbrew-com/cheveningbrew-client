import React, { useRef } from "react";
import styles from "./ActionBox.module.css";
import { ActionBoxProvider } from "../../context/ActionBoxContext";

const ActionBox = ({ children }) => {
  const actionBoxRef = useRef(null);

  return (
    <ActionBoxProvider>
      <div ref={actionBoxRef} className={styles.actionBox} style={{ position: 'relative' }}>
        {children}
      </div>
    </ActionBoxProvider>
  );
};

export default ActionBox;
