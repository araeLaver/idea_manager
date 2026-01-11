import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import api, { ApiError } from '../services/api';
import { guestStorage } from '../services/guestStorage';
import type { IdeaFormData } from '../types';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface GuestDataInfo {
  ideaCount: number;
  memoCount: number;
}

interface MigrationResult {
  ideas: number;
  memos: number;
  totalIdeas: number;
  totalMemos: number;
  failedIdeas: string[];
  failedMemos: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  sessionExpired: boolean;
  login: (email: string, password: string, migrateData?: boolean) => Promise<MigrationResult | null>;
  register: (email: string, password: string, name: string, migrateData?: boolean) => Promise<MigrationResult | null>;
  logout: () => void;
  continueAsGuest: () => void;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearSessionExpired: () => void;
  getGuestDataInfo: () => GuestDataInfo;
  hasGuestData: () => boolean;
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

  const getGuestDataInfo = useCallback((): GuestDataInfo => {
    const ideas = guestStorage.getIdeas();
    const memos = guestStorage.getMemos();
    return {
      ideaCount: ideas.length,
      memoCount: memos.length,
    };
  }, []);

  const hasGuestData = useCallback((): boolean => {
    const info = getGuestDataInfo();
    return info.ideaCount > 0 || info.memoCount > 0;
  }, [getGuestDataInfo]);

  const migrateGuestDataToServer = async (): Promise<MigrationResult> => {
    const ideas = guestStorage.getIdeas();
    const memos = guestStorage.getMemos();

    // Convert ideas to IdeaFormData format
    const ideaFormData: IdeaFormData[] = ideas.map(idea => ({
      title: idea.title,
      description: idea.description,
      category: idea.category,
      tags: idea.tags,
      status: idea.status,
      priority: idea.priority,
      notes: idea.notes || '',
      targetMarket: idea.targetMarket || '',
      potentialRevenue: idea.potentialRevenue || '',
      resources: idea.resources || '',
      timeline: idea.timeline || '',
    }));

    // Convert memos to simple format
    const memoData = memos.map(memo => ({
      date: memo.date,
      content: memo.content,
    }));

    const result = await api.migrateGuestData(ideaFormData, memoData);

    // Clear guest data after successful migration
    guestStorage.clear();

    return result;
  };

  const login = async (email: string, password: string, migrateData: boolean = false): Promise<MigrationResult | null> => {
    const { user: userData } = await api.login(email, password);
    setUser(userData);
    setSessionExpired(false);

    let migrationResult: MigrationResult | null = null;

    // Migrate guest data if requested and guest data exists
    if (migrateData && isGuest && hasGuestData()) {
      migrationResult = await migrateGuestDataToServer();
    } else {
      // Clear guest data without migration
      guestStorage.clear();
    }

    setIsGuest(false);
    localStorage.removeItem('guestMode');

    return migrationResult;
  };

  const register = async (email: string, password: string, name: string, migrateData: boolean = false): Promise<MigrationResult | null> => {
    const { user: userData } = await api.register(email, password, name);
    setUser(userData);

    let migrationResult: MigrationResult | null = null;

    // Migrate guest data if requested and guest data exists
    if (migrateData && isGuest && hasGuestData()) {
      migrationResult = await migrateGuestDataToServer();
    } else {
      // Clear guest data without migration
      guestStorage.clear();
    }

    setIsGuest(false);
    localStorage.removeItem('guestMode');

    return migrationResult;
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
        getGuestDataInfo,
        hasGuestData,
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
