import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFooter } from "../../context/FooterContext";
import "./Footer.css";
import packageJson from "../../../package.json";

const Footer = () => {
  const { isFooterExpanded, toggleFooter, rememberPreference, updateRememberPreference, isMobile } = useFooter();
  const footerLinksRef = useRef(null);
  
  // Add focus trap logic when footer is expanded on mobile
  useEffect(() => {
    if (isFooterExpanded && isMobile) {
      const focusableElements = footerLinksRef.current?.querySelectorAll(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements?.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [isFooterExpanded, isMobile]);

  return (
    <footer>
      <div className="glass flex flex-col md:flex-row justify-between items-center px-1 md:px-10">
        {/* Mobile toggle button - only visible when isMobile is true */}
        {isMobile && (
          <button 
            className="w-full py-2 flex justify-center items-center bg-transparent border-none text-white cursor-pointer" 
            onClick={toggleFooter}
            aria-expanded={isFooterExpanded}
            aria-controls="footer-links"
          >
            <span className="text-xs mr-1">{isFooterExpanded ? 'Hide Menu' : 'Show Menu'}</span>
            <svg 
              className={`w-3 h-3 transition-transform duration-300 ${isFooterExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
        
        {/* Single footer links container with conditional styling */}
        <div 
          id="footer-links"
          ref={footerLinksRef}
          className={`footer-links-container ${isMobile ? 'mobile' : 'desktop'} ${isFooterExpanded ? 'expanded' : ''}`}
        >
          <div className="footer-links">
            <Link to="/help" className="nav-link">Help</Link>
            <Link to="/about" className="nav-link">About</Link>
            {/* <Link to="/pricing" className="nav-link">Pricing</Link> */}
            <Link to="/privacy" className="nav-link">Privacy</Link>
            <Link to="/terms" className="nav-link">Terms</Link>
            <Link to="/essays" className="nav-link">Essay Collection</Link>
          </div>
          
         
        </div>

        {/* Copyright - always visible */}
        <div className="copyright opacity-80">
          © cheveningbrew.com {new Date().getFullYear()} | All rights
          reserved. Version {packageJson.version}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
