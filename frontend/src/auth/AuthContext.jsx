import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from './authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password, rememberMe = false) => {
    try {
      const userData = await authService.login(email, password);
      authService.saveUser(userData);
      if (rememberMe) {
        authService.setRememberedEmail(email);
      } else {
        authService.setRememberedEmail('');
      }
      setUser(userData);
      return { success: true, data: userData };
    } catch (error) {
      return { success: false, error: error.detail || 'Login failed' };
    }
  }, []);

  const signup = useCallback(async (userData) => {
    try {
      const response = await authService.signup(userData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.detail || 'Registration failed' };
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      authService.saveUser(updatedUser);
      setUser(updatedUser);
      return { success: true, data: updatedUser };
    } catch (error) {
      return { success: false, error: error.detail || 'Profile update failed' };
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
