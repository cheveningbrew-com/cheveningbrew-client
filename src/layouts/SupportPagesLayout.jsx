import React, { useState, useEffect } from "react";
import Footer from "../components/Footer/Footer";
import Logo from "../components/Logo/Logo";
import NameDisplay from "../components/NameDisplay/NameDisplay";
import SignOUt from "../components/SignOut/SignOut";
import styles from "./layout.module.css";

const SupportPagesLayout = ({ children }) => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Get username from localStorage when component mounts
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);
  return (
    <div className={styles.pageContainer}>
      <div className={styles.mainLayout}>
        <div className={styles.navigationContainer}>
          {userName && <NameDisplay userName={userName} />}
          <Logo />
          <SignOUt />
        </div>
        <div className={styles.contentContainer}>{children}</div>
      </div>
      <Footer />
    </div>
  );
};

export default SupportPagesLayout;
