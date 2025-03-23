// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { validateToken, clearAuthData } from '../utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    console.log("Checking auth status...");
    setLoading(true);

    // Log token for debugging
    const token = sessionStorage.getItem('authToken');
    console.log("Token exists:", !!token);

    if (validateToken()) {
      console.log("Token is valid, setting authenticated");
      setIsAuthenticated(true);
      setUserName(sessionStorage.getItem('userName'));
    } else {
      console.log("Token is invalid or missing");
      clearAuthData();
      setIsAuthenticated(false);
      setUserName(null);
    }

    setLoading(false);
  };

  const login = (token, name, email) => {
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('userName', name || '');
    sessionStorage.setItem('userEmail', email || '');
    checkAuthStatus();
  };

  const logout = () => {
    // Clear all application-specific sessionStorage items
    const itemsToClear = [
      'ally-supports-cache',
      'chatHistoryPath',
      'interviewDone',
      'interviewQuestions',
      'lk-user-choices',
      'paymentCompleted',
      'userEmail',
      'userName',
      'authToken',
      'cachedFeedback'
    ];

    itemsToClear.forEach(item => sessionStorage.removeItem(item));

    // Reset authentication state
    setIsAuthenticated(false);
    setUserName(null);
  };


  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userName,
        loading,
        checkAuthStatus,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);