import '@testing-library/jest-dom'
import { vi } from 'vitest';
import type { ReactNode } from 'react';

// Mock ToastContext
vi.mock('../contexts/ToastContext', () => ({
  useToast: () => ({
    toasts: [],
    showToast: vi.fn(),
    removeToast: vi.fn(),
  }),
  ToastProvider: ({ children }: { children: ReactNode }) => children,
}));

// Mock NotificationContext
vi.mock('../contexts/NotificationContext', () => ({
  useNotifications: () => ({
    notifications: [],
    unreadCount: 0,
    addNotification: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    removeNotification: vi.fn(),
    clearAll: vi.fn(),
    requestPermission: vi.fn().mockResolvedValue(false),
    hasPermission: false,
  }),
  NotificationProvider: ({ children }: { children: ReactNode }) => children,
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock localStorage with a fresh implementation for each test
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    length: 0,
    key: () => null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});