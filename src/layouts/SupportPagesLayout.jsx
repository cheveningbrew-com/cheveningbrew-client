import React, { useState, useEffect } from "react";
import Footer from "../components/Footer/Footer";
import Logo from "../components/Logo/Logo";
import NameDisplay from "../components/NameDisplay/NameDisplay";
import SignOUt from "../components/SignOut/SignOut";
import styles from "./layout.module.css";
import { readUserField,getUserEmail } from "../services/api";

const SupportPagesLayout = ({ children }) => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserName = async () => {
      const userEmail = getUserEmail()
      if (userEmail) {
        const storedName = await readUserField(userEmail, 'userName');
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
            {userName && <NameDisplay userName={userName} />}
              <SignOUt />
            </div>
          </div>
        </div>
        <div className={styles.contentContainer}>{children}</div>
      </div>
      <Footer />
    </div>
  );
};

export default SupportPagesLayout;
