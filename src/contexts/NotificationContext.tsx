import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { AppNotification, Idea } from '../types';
import { useData } from './DataContext';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  requestPermission: () => Promise<boolean>;
  hasPermission: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'idea_manager_notifications';
const CHECKED_DEADLINES_KEY = 'idea_manager_checked_deadlines';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { ideas } = useData();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

  // Load notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (e) {
        if (import.meta.env.DEV) {
          console.error('Failed to parse notifications:', e);
        }
      }
    }

    // Check browser notification permission
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Request browser notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      setHasPermission(true);
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setHasPermission(granted);
      return granted;
    }

    return false;
  }, []);

  // Add a new notification
  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: AppNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show browser notification if permitted
    if (hasPermission && 'Notification' in window) {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/icon-192x192.png',
        tag: newNotification.id,
      });
    }
  }, [hasPermission]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Check deadlines and create reminders
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      // Get already checked deadlines for today
      const checkedData = localStorage.getItem(CHECKED_DEADLINES_KEY);
      let checkedDeadlines: { date: string; ideaIds: string[] } = { date: '', ideaIds: [] };

      if (checkedData) {
        try {
          checkedDeadlines = JSON.parse(checkedData);
          // Reset if it's a new day
          if (checkedDeadlines.date !== today) {
            checkedDeadlines = { date: today, ideaIds: [] };
          }
        } catch {
          checkedDeadlines = { date: today, ideaIds: [] };
        }
      } else {
        checkedDeadlines = { date: today, ideaIds: [] };
      }

      ideas.forEach((idea: Idea) => {
        if (!idea.deadline || !idea.reminderEnabled || idea.status === 'completed' || idea.status === 'archived') {
          return;
        }

        // Skip if already checked today
        if (checkedDeadlines.ideaIds.includes(idea.id)) {
          return;
        }

        const deadline = new Date(idea.deadline);
        const reminderDays = idea.reminderDays || 3;
        const reminderDate = new Date(deadline);
        reminderDate.setDate(reminderDate.getDate() - reminderDays);

        const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Check if it's time to remind
        if (now >= reminderDate && now < deadline) {
          addNotification({
            type: 'reminder',
            title: '마감일 리마인더',
            message: `"${idea.title}" 마감일이 ${daysUntilDeadline}일 남았습니다.`,
            ideaId: idea.id,
          });
          checkedDeadlines.ideaIds.push(idea.id);
        }

        // Check if deadline is today
        if (daysUntilDeadline === 0) {
          addNotification({
            type: 'deadline',
            title: '오늘 마감!',
            message: `"${idea.title}" 마감일이 오늘입니다!`,
            ideaId: idea.id,
          });
          checkedDeadlines.ideaIds.push(idea.id);
        }

        // Check if deadline has passed
        if (daysUntilDeadline < 0) {
          addNotification({
            type: 'warning',
            title: '마감일 초과',
            message: `"${idea.title}" 마감일이 ${Math.abs(daysUntilDeadline)}일 지났습니다.`,
            ideaId: idea.id,
          });
          checkedDeadlines.ideaIds.push(idea.id);
        }
      });

      // Save checked deadlines
      localStorage.setItem(CHECKED_DEADLINES_KEY, JSON.stringify(checkedDeadlines));
    };

    // Check on mount and every hour
    checkDeadlines();
    const interval = setInterval(checkDeadlines, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [ideas, addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        requestPermission,
        hasPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
