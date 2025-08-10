import React, { useState, useEffect } from "react";
import Footer from "../components/Footer/Footer";
import Logo from "../components/Logo/Logo";
import NameDisplay from "../components/NameDisplay/NameDisplay";
import SignOut from "../components/SignOut/SignOut";
import SignIn from "../components/SignIn/SignIn";
import styles from "./layout.module.css";
import { readUserField, getUserId } from "../services/api";
import { useAuth } from "../context/AuthContext";

const SupportPagesLayout = ({ children }) => {
  const [userName, setUserName] = useState("");
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchUserName = async () => {
      const user_id = getUserId()
      if (user_id) {
        const storedName = await readUserField(user_id, 'name');
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
              {isAuthenticated ? <SignOut /> : <SignIn />}
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
