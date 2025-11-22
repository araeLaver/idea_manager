import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

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
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  continueAsGuest: () => void;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

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
          console.error('Failed to get user:', error);
          api.setToken(null);
        }
      } else if (guestMode === 'true') {
        setIsGuest(true);
      } else {
        // 첫 방문자는 자동으로 게스트 모드 시작
        localStorage.setItem('guestMode', 'true');
        setIsGuest(true);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { user: userData } = await api.login(email, password);
    setUser(userData);
    setIsGuest(false);
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
        login,
        register,
        logout,
        continueAsGuest,
        updateProfile,
        changePassword,
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
