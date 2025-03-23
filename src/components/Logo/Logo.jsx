import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Logo.module.css"; // Import as a module
import logo from "../../assets/images/logo.png"

const Logo = () => {
  const [redirectTo, setRedirectTo] = useState("/");

  useEffect(() => {
    const sessionToken = sessionStorage.getItem("authToken");
    if (sessionToken) {
      setRedirectTo("/upload");
    }
  }, []);

  return (
    <Link to={redirectTo} className={styles.logoLink}>
      <img src={logo} alt="logo" />
    </Link>
  );
};

export default Logo;
