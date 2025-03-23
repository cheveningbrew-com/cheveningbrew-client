import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import packageJson from "../../../package.json";

const Footer = () => {
  return (
    <footer>
      <div className="glass flex flex-col md:flex-row justify-between items-center md:items-center px-1 md:px-10">
        <div className="footer-links">
          <Link to="/help" className="nav-link">
            Help
          </Link>
          <Link to="/about" className="nav-link">
            About
          </Link>
          <Link to="/pricing" className="nav-link">
            Pricing
          </Link>
          <Link to="/privacy" className="nav-link">
            Privacy
          </Link>
          <Link to="/terms" className="nav-link">
            Terms
          </Link>
        </div>

        <div className="copyright opacity-80">
            © cheveningbrew.com {new Date().getFullYear()} | All rights
            reserved. Version {packageJson.version}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
