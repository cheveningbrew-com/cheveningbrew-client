import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Tabs.module.css";

const Tabs = ({ isLoading = false }) => {
  const location = useLocation();

  const tabs = [
    { path: "/upload", label: "Upload" },
    { path: "/feedback", label: "Feedback" },
  ];

  return (
    <div className={styles.tabsContainer}>
      {tabs.map((tab) => {
        if (isLoading) {
          return (
            <div
              key={tab.path}
              className={`${styles.tabLink} ${styles.disabled} ${
                location.pathname === tab.path ? styles.active : ""
              } ${tab.label === "Upload" ? styles.firstTab : ""}`}
            >
              {tab.label}
            </div>
          );
        }
        return (
          <Link
            to={tab.path}
            key={tab.path}
            className={`${styles.tabLink} ${
              location.pathname === tab.path ? styles.active : ""
            } ${tab.label === "Upload" ? styles.firstTab : ""}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
};

export default Tabs;