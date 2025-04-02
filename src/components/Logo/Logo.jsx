import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Logo.module.css"; // Import as a module
import logo from "../../assets/images/logo.png"
import { readUserField } from "../../services/api";

const Logo = () => {
  const [redirectTo, setRedirectTo] = useState("/");

  useEffect(() => {
    const fetchSessionToken = async () => {
      const userEmail = sessionStorage.getItem("userEmail");

      const sessionToken = await readUserField(userEmail, "auth_token");

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
