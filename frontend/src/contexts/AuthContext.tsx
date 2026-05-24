import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, userData?: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for saved user session on mount
    const savedUser = localStorage.getItem('healthPredictorUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email: string, password: string, userData?: Partial<User>) => {
    const loginData: User = {
      email: userData?.email || email,
      name: userData?.name || email.split('@')[0],
      firstName: userData?.firstName,
      lastName: userData?.lastName,
      dateOfBirth: userData?.dateOfBirth
    };
    setUser(loginData);
    localStorage.setItem('healthPredictorUser', JSON.stringify(loginData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('healthPredictorUser');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
