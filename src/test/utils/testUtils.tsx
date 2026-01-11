import { ReactNode, createContext, useContext } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { vi } from 'vitest';

// Mock Toast Context
const MockToastContext = createContext({
  toasts: [],
  showToast: vi.fn(),
  removeToast: vi.fn(),
});

export const MockToastProvider = ({ children }: { children: ReactNode }) => (
  <MockToastContext.Provider value={{ toasts: [], showToast: vi.fn(), removeToast: vi.fn() }}>
    {children}
  </MockToastContext.Provider>
);

// Mock Notification Context
const MockNotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  addNotification: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  removeNotification: vi.fn(),
  clearAll: vi.fn(),
  requestPermission: vi.fn(),
  hasPermission: false,
});

export const MockNotificationProvider = ({ children }: { children: ReactNode }) => (
  <MockNotificationContext.Provider value={{
    notifications: [],
    unreadCount: 0,
    addNotification: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    removeNotification: vi.fn(),
    clearAll: vi.fn(),
    requestPermission: vi.fn().mockResolvedValue(false),
    hasPermission: false,
  }}>
    {children}
  </MockNotificationContext.Provider>
);

// Export mock hooks for use in vi.mock
export const mockUseToast = () => useContext(MockToastContext);
export const mockUseNotifications = () => useContext(MockNotificationContext);

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

// Create wrapper with all necessary providers (using data router for useBlocker support)
export const createTestWrapper = (initialPath: string = '/') => {
  return ({ children }: { children: ReactNode }) => {
    const router = createMemoryRouter(
      [{ path: '*', element: children }],
      { initialEntries: [initialPath] }
    );

    return (
      <ThemeProvider>
        <MockToastProvider>
          <MockNotificationProvider>
            <RouterProvider router={router} />
          </MockNotificationProvider>
        </MockToastProvider>
      </ThemeProvider>
    );
  };
};

// Simple wrapper without router (for unit tests that don't need routing)
export const createSimpleWrapper = () => {
  return ({ children }: { children: ReactNode }) => (
    <ThemeProvider>
      <MockToastProvider>
        <MockNotificationProvider>
          {children}
        </MockNotificationProvider>
      </MockToastProvider>
    </ThemeProvider>
  );
};

// Reset all mocks helper
export const resetAllMocks = () => {
  vi.clearAllMocks();
  localStorage.clear();
};
