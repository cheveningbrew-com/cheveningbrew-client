// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { validateToken, clearAuthData } from '../utils/auth';
import { readUserField, getUserId } from '../services/api';
import { STORAGE_KEYS } from '../constants/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log("Checking auth status...");
      setLoading(true);

      const user_id = getUserId();
      if (!user_id) {
        throw new Error("No user ID found");
      }

      // Fetch both user fields in a single Promise.all
      const [token, name] = await Promise.all([
        readUserField(user_id, "auth_token"),
        readUserField(user_id, "name")
      ]);

      console.log("Token exists:", !!token);

      if (token && validateToken(token)) {
        console.log("Token is valid, setting authenticated");
        setIsAuthenticated(true);
        setUserName(name);
      } else {
        console.log("Token is invalid or missing");
        clearAuthData();
        setIsAuthenticated(false);
        setUserName(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      clearAuthData();
      setIsAuthenticated(false);
      setUserName(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (token, name, id) => {
    try {
      if (!id) {
        throw new Error("Invalid user ID");
      }

      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      sessionStorage.setItem(STORAGE_KEYS.USER_ID, id);
      if (name) {
        sessionStorage.setItem(STORAGE_KEYS.USER_NAME, name);
      }
      
      await checkAuthStatus();
    } catch (error) {
      console.error("Login error:", error);
      clearAuthData();
      setIsAuthenticated(false);
      setUserName(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear all application-specific sessionStorage items
    Object.values(STORAGE_KEYS).forEach(key => sessionStorage.removeItem(key));

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