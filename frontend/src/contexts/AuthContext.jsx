import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('interview_ai_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('interview_ai_access_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user and profile from backend
  const fetchCurrentUser = useCallback(async () => {
    const currentToken = localStorage.getItem('interview_ai_access_token');
    if (!currentToken) {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiClient.get('/auth/me');
      if (res.success && res.data) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        localStorage.setItem('interview_ai_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Session verification failed:', err.message);
      setUser(null);
      setProfile(null);
      setToken(null);
      localStorage.removeItem('interview_ai_access_token');
      localStorage.removeItem('interview_ai_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Register action
  const register = async ({ fullName, email, password }) => {
    const res = await apiClient.post('/auth/register', { fullName, email, password });
    if (res.success && res.data) {
      const { user: userData, profile: profileData, accessToken } = res.data;
      setToken(accessToken);
      setUser(userData);
      setProfile(profileData);
      localStorage.setItem('interview_ai_access_token', accessToken);
      localStorage.setItem('interview_ai_user', JSON.stringify(userData));
    }
    return res;
  };

  // Login action
  const login = async ({ email, password }) => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.success && res.data) {
      const { user: userData, profile: profileData, accessToken } = res.data;
      setToken(accessToken);
      setUser(userData);
      setProfile(profileData);
      localStorage.setItem('interview_ai_access_token', accessToken);
      localStorage.setItem('interview_ai_user', JSON.stringify(userData));
    }
    return res;
  };

  // Logout action
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (err) {
      console.warn('Logout request failed:', err.message);
    } finally {
      setUser(null);
      setProfile(null);
      setToken(null);
      localStorage.removeItem('interview_ai_access_token');
      localStorage.removeItem('interview_ai_user');
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    const res = await apiClient.put('/profile', profileData);
    if (res.success && res.data) {
      setProfile(res.data);
    }
    return res;
  };

  const value = {
    user,
    profile,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    register,
    login,
    logout,
    updateProfile,
    refetchUser: fetchCurrentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
