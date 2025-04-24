import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Logo.module.css"; // Import as a module
import logo from "../../assets/images/logo.png"
import { readUserField,getUserId} from "../../services/api";

const Logo = () => {
  const [redirectTo, setRedirectTo] = useState("/");

  useEffect(() => {
    const fetchSessionToken = async () => {
      const user_id = await getUserId();

      const sessionToken = await readUserField(user_id, "auth_token");

      if (sessionToken) {
        setRedirectTo("/upload");
      }
    };

    fetchSessionToken();
  }, []);

  return (
    <Link to={redirectTo} className={styles.logoLink}>
      <img src={logo} alt="logo" />
    </Link>
  );
};

export default Logo;
