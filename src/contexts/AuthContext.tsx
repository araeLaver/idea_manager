import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import api, { ApiError } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  continueAsGuest: () => void;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Handle session expiration
  const handleSessionExpired = useCallback(() => {
    setUser(null);
    setSessionExpired(true);
    api.setToken(null);
  }, []);

  const clearSessionExpired = useCallback(() => {
    setSessionExpired(false);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      const guestMode = localStorage.getItem('guestMode');

      if (token) {
        try {
          const userData = await api.getCurrentUser();
          setUser(userData);
          setIsGuest(false);
        } catch (error) {
          // Check if it's a token expiration error
          if (error instanceof ApiError && error.isAuthError) {
            handleSessionExpired();
          } else {
            // Invalid token or other error - clear and continue
            api.setToken(null);
          }
        }
      } else if (guestMode === 'true') {
        setIsGuest(true);
      }
      setLoading(false);
    };

    initAuth();
  }, [handleSessionExpired]);

  const login = async (email: string, password: string) => {
    const { user: userData } = await api.login(email, password);
    setUser(userData);
    setIsGuest(false);
    setSessionExpired(false);
    localStorage.removeItem('guestMode');
  };

  const register = async (email: string, password: string, name: string) => {
    const { user: userData } = await api.register(email, password, name);
    setUser(userData);
    setIsGuest(false);
    localStorage.removeItem('guestMode');
  };

  const logout = () => {
    api.logout();
    setUser(null);
    localStorage.removeItem('guestMode');
    setIsGuest(false);
  };

  const continueAsGuest = () => {
    localStorage.setItem('guestMode', 'true');
    setIsGuest(true);
  };

  const updateProfile = async (data: { name?: string; email?: string }) => {
    const updatedUser = await api.updateProfile(data);
    setUser(updatedUser);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await api.changePassword(currentPassword, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isGuest,
        sessionExpired,
        login,
        register,
        logout,
        continueAsGuest,
        updateProfile,
        changePassword,
        clearSessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
