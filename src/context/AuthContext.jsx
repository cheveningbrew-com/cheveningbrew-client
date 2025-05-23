// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { validateToken, clearAuthData } from '../utils/auth';
import { readUserField } from '../services/api';
import { STORAGE_KEYS } from '../constants/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log("Checking auth status...");
      setLoading(true);

      const token = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const user_id = sessionStorage.getItem(STORAGE_KEYS.USER_ID);

      if (!token || !user_id) {
        throw new Error("Missing token or user_id");
      }

      const isValid = await validateToken(token); // ✅ Awaiting async token validation

      if (isValid) {
        const name = await readUserField(user_id, "name"); // ✅ Awaiting async user field
        sessionStorage.setItem(STORAGE_KEYS.USER_NAME, name);
        setIsAuthenticated(true);
        setUserName(name);
      } else {
        throw new Error("Invalid token");
      }

    } catch (error) {
      console.error("Error checking auth status:", error);
      clearAuthData();
      setIsAuthenticated(false);
      setUserName(null);
    } finally {
      setLoading(false); // ✅ Ensures UI isn't stuck loading
    }
  };

  const login = async (token, name, id) => {
    try {
      setLoading(true);
      if (!id) throw new Error("Invalid user ID");

      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      sessionStorage.setItem(STORAGE_KEYS.USER_ID, id);

      if (!name) {
        name = await readUserField(id, "name"); // fallback if name not passed
      }

      sessionStorage.setItem(STORAGE_KEYS.USER_NAME, name);
      setIsAuthenticated(true);
      setUserName(name);

    } catch (error) {
      console.error("Login error:", error);
      clearAuthData();
      setIsAuthenticated(false);
      setUserName(null);
    } finally {
      setLoading(false); // ✅ Always called to update UI state
    }
  };

  const logout = () => {
    Object.values(STORAGE_KEYS).forEach(key => sessionStorage.removeItem(key));
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
