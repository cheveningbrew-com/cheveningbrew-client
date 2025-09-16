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
  const [userEmail, setUserEmail] = useState(null);
  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log("Checking auth status...");
      setLoading(true);
      // 1) Prefer sessionStorage auth first (avoids race with DB writes)
      const sessionToken = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const sessionName = sessionStorage.getItem(STORAGE_KEYS.USER_NAME);
      const sessionEmail = sessionStorage.getItem(STORAGE_KEYS.USER_EMAIL);
      const sessionUserId = sessionStorage.getItem(STORAGE_KEYS.USER_ID);

      if (sessionToken && validateToken(sessionToken)) {
        console.log("Session token valid; authenticating from sessionStorage");
        setIsAuthenticated(true);
        setUserName(sessionName);
        setUserEmail(sessionEmail);

        // Fire-and-forget: try to refresh from DB in background, but don't flip state on failure
        (async () => {
          try {
            if (!sessionUserId) return;
            const [dbToken, dbName, dbEmail] = await Promise.all([
              readUserField(sessionUserId, "auth_token"),
              readUserField(sessionUserId, "name"),
              readUserField(sessionUserId, "email")
            ]);
            if (dbToken && validateToken(dbToken)) {
              if (dbName) setUserName(dbName);
              if (dbEmail) setUserEmail(dbEmail);
            }
          } catch (bgErr) {
            console.warn("Background DB auth refresh failed:", bgErr);
          }
        })();
        return; // We're authenticated; no need to block on DB
      }

      // 2) If no valid session token, attempt to read from DB if we have a user id
      const user_id = sessionUserId || getUserId();
      if (!user_id) {
        console.log("No user ID in session; unauthenticated");
        clearAuthData();
        setIsAuthenticated(false);
        setUserName(null);
        setUserEmail(null);
        return;
      }

      const [token, name, email] = await Promise.all([
        readUserField(user_id, "auth_token"),
        readUserField(user_id, "name"),
        readUserField(user_id, "email")
      ]);

      console.log("DB token exists:", !!token);

      if (token && validateToken(token)) {
        console.log("DB token valid; authenticating from DB");
        setIsAuthenticated(true);
        setUserName(name);
        setUserEmail(email);
        // sync to sessionStorage for future fast loads
        sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        if (name) sessionStorage.setItem(STORAGE_KEYS.USER_NAME, name);
        if (email) sessionStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
      } else {
        console.log("DB token invalid or missing");
        clearAuthData();
        setIsAuthenticated(false);
        setUserName(null);
        setUserEmail(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      clearAuthData();
      setIsAuthenticated(false);
      setUserName(null);
      setUserEmail(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (token, name, id, email) => {
    try {
      if (!id) {
        throw new Error("Invalid user ID");
      }
      console.log("Setting auth data to sessionStorage");
      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      sessionStorage.setItem(STORAGE_KEYS.USER_ID, id);
      sessionStorage.setItem(STORAGE_KEYS.USER_EMAIL, email );
      if (name) {
        sessionStorage.setItem(STORAGE_KEYS.USER_NAME, name);
      }
      // Immediately update state to avoid waiting on DB round-trip
      if (token && validateToken(token)) {
        setIsAuthenticated(true);
        setUserName(name || null);
        setUserEmail(email || null);
      } else {
        throw new Error("Invalid auth token");
      }
    } catch (error) {
      console.error("Login error:", error);
      clearAuthData();
      setIsAuthenticated(false);
      setUserName(null);
      setUserEmail(null);
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
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userName,
        userEmail,
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