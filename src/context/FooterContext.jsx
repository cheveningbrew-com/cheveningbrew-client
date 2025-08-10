import React, { createContext, useState, useContext, useEffect } from 'react';

const FooterContext = createContext();

export const FooterProvider = ({ children }) => {
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [rememberPreference, setRememberPreference] = useState(
    localStorage.getItem('rememberFooterPreference') === 'true'
  );
  
  // Handle window resize events
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Load saved preference on initial render
  useEffect(() => {
    if (rememberPreference) {
      const savedState = localStorage.getItem('footerExpanded');
      if (savedState !== null) {
        setIsFooterExpanded(savedState === 'true');
      }
    }
  }, [rememberPreference]);
  
  const toggleFooter = () => {
    const newState = !isFooterExpanded;
    setIsFooterExpanded(newState);
    
    if (rememberPreference) {
      localStorage.setItem('footerExpanded', newState.toString());
    }
  };

  const updateRememberPreference = (value) => {
    setRememberPreference(value);
    localStorage.setItem('rememberFooterPreference', value.toString());
    
    // If turning off remember preference, remove saved state
    if (!value) {
      localStorage.removeItem('footerExpanded');
    } else {
      // If turning on, save current state
      localStorage.setItem('footerExpanded', isFooterExpanded.toString());
    }
  };
  
  return (
    <FooterContext.Provider value={{ 
      isFooterExpanded, 
      toggleFooter, 
      rememberPreference, 
      updateRememberPreference,
      isMobile
    }}>
      {children}
    </FooterContext.Provider>
  );
};

export const useFooter = () => useContext(FooterContext);
