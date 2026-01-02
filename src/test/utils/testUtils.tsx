import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { vi } from 'vitest';

// Mock AuthContext for testing
export const mockAuthContext = {
  user: null,
  loading: false,
  isAuthenticated: false,
  isGuest: true,
  sessionExpired: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  continueAsGuest: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
  clearSessionExpired: vi.fn(),
  getGuestDataInfo: vi.fn(() => ({ ideaCount: 0, memoCount: 0 })),
  hasGuestData: vi.fn(() => false),
};

// Create a mock AuthProvider for testing
export const MockAuthProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

// Mock DataContext for testing
export const mockDataContext = {
  ideas: [],
  memos: [],
  stats: {
    total: 0,
    completed: 0,
    inProgress: 0,
    draft: 0,
    archived: 0,
    highPriority: 0,
    completionRate: 0,
    topCategories: [],
    topTags: [],
  },
  loading: false,
  error: null,
  refreshData: vi.fn(),
  createIdea: vi.fn(),
  updateIdea: vi.fn(),
  deleteIdea: vi.fn(),
  saveMemo: vi.fn(),
  deleteMemo: vi.fn(),
};

// Create wrapper with all necessary providers
export const createTestWrapper = () => {
  return ({ children }: { children: ReactNode }) => (
    <BrowserRouter>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Reset all mocks helper
export const resetAllMocks = () => {
  vi.clearAllMocks();
  localStorage.clear();
};
