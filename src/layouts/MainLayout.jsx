import React, { useState } from "react";
import Tabs from "../components/Header/Tabs/Tabs";
import Footer from "../components/Footer/Footer";
import Logo from "../components/Logo/Logo";
import NameDisplay from "../components/NameDisplay/NameDisplay";
import SignOut from "../components/SignOut/SignOut";
import styles from "./layout.module.css";
// import {getUserId, readUserField} from "../services/api"

const MainLayout = ({ children }) => {
  const [userName, setUserName] = useState("Demo User");

  // useEffect(() => {
  //   const fetchUserName = async () => {
  //     const user_id = getUserId();
  //     if (user_id) {
  //       const storedName = await readUserField(user_id, "name");
  //       if (storedName) {
  //         setUserName(storedName);
  //       }
  //     }
  //   };
  
  //   fetchUserName();
  // }, []);
  
  return (
    <div className={styles.pageContainer}>
      <div className={styles.mainLayout}>
        <div className={styles.navigationContainer}>
          <div className={styles.navigationHead}>
            <Logo />
            <div className={styles.navigationUser}>
              <NameDisplay userName={userName} />
              <SignOut />
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