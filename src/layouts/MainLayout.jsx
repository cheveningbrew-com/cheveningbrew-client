import React, { useState, useEffect } from "react";
import Tabs from "../components/Header/Tabs/Tabs";
import Footer from "../components/Footer/Footer";
import Logo from "../components/Logo/Logo";
import NameDisplay from "../components/NameDisplay/NameDisplay";
import SignOUt from "../components/SignOut/SignOut";
import styles from "./layout.module.css";

const MainLayout = ({ children }) => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Get username from sessionStorage when component mounts
    const storedName = sessionStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);
  return (
    <div className={styles.pageContainer}>
      <div className={styles.mainLayout}>
        <div className={styles.navigationContainer}>
          <NameDisplay userName={userName} />
          <Logo />
          <SignOUt />
          <Tabs />
        </div>
        <div className={styles.contentContainer}>{children}</div>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
