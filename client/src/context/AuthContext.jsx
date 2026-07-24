import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    sessionStorage.getItem('mealhub_token') || null
  );
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().substring(0, 7)
  );
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [theme, setThemeState] = useState(
    localStorage.getItem('mealhub_theme') || 'midnight'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const changeTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('mealhub_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    // Ensure legacy token in localStorage is removed so sessions are isolated per tab/session
    localStorage.removeItem('mealhub_token');
    fetchMaintenanceStatus();
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }

    // Interval to poll maintenance status every 5 seconds
    const interval = setInterval(fetchMaintenanceStatus, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchMaintenanceStatus = async () => {
    try {
      const res = await API.get('/system/maintenance');
      setIsMaintenanceMode(res.data.isMaintenanceMode);
    } catch (err) {
      console.error('Failed to fetch maintenance status');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to load user session', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const toggleMaintenanceMode = async (nextState) => {
    const res = await API.post('/system/maintenance', { isMaintenanceMode: nextState });
    setIsMaintenanceMode(res.data.isMaintenanceMode);
    return res.data.isMaintenanceMode;
  };

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token: newToken, ...userData } = res.data;
    sessionStorage.setItem('mealhub_token', newToken);
    localStorage.removeItem('mealhub_token');
    setToken(newToken);
    setUser(userData);
    setLoading(false);
    return userData;
  };

  const logout = () => {
    sessionStorage.removeItem('mealhub_token');
    localStorage.removeItem('mealhub_token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        selectedMonth,
        setSelectedMonth,
        isMaintenanceMode,
        toggleMaintenanceMode,
        fetchMaintenanceStatus,
        theme,
        changeTheme,
        login,
        logout,
        fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
