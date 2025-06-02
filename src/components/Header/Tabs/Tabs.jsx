import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Tabs.module.css";

const Tabs = () => {
  const location = useLocation();

  // Remove Interview tab
  const tabs = [
    { path: "/upload", label: "Upload" },
    // Remove interview tab
    { path: "/feedback", label: "Feedback" },
  ];

  return (
    <div className={styles.tabsContainer}>
      {tabs.map((tab) => (
        <Link
          to={tab.path}
          key={tab.path}
          className={`${styles.tabLink} ${
            location.pathname === tab.path ? styles.active : ""
          } ${tab.label === "Upload" ? styles.firstTab : ""}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
};

export default Tabs;