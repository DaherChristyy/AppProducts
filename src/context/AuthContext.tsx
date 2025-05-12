import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Text } from 'react-native';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string | null, password: string | null };
  login: (email: string, password: string) => void;
  logout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('Rendering children inside AuthProvider:', children);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ email: string | null, password: string | null }>({ email: null, password: null });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const login = (email: string, password: string) => {
    setUser({ email, password });
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser({ email: null, password: null });
    setIsAuthenticated(false);
  };

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isDarkMode, toggleDarkMode }}>
      {typeof children === 'string' ? <Text>{children}</Text> : children} 
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
