import React, { useState, useEffect } from "react";
import Tabs from "../components/Header/Tabs/Tabs";
import Footer from "../components/Footer/Footer";
import Logo from "../components/Logo/Logo";
import NameDisplay from "../components/NameDisplay/NameDisplay";
import SignOUt from "../components/SignOut/SignOut";
import styles from "./layout.module.css";
import {getUserId,readUserField} from "../services/api"

const MainLayout = ({ children }) => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserName = async () => {
      const userId = getUserId();
      if (userId) {
        const storedName = await readUserField(userId, "name");
        if (storedName) {
          setUserName(storedName);
        }
      }
    };
  
    fetchUserName();
  }, []);
  
  return (
    <div className={styles.pageContainer}>
      <div className={styles.mainLayout}>
        <div className={styles.navigationContainer}>
          <div className={styles.navigationHead}>
            <Logo />
            <div className={styles.navigationUser}>
              <NameDisplay userName={userName} />
              <SignOUt />
            </div>
          </div>

          <Tabs />
        </div>
        <div className={styles.contentContainer}>{children}</div>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
