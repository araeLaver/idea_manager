import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, CheckCheck, Trash2, AlertCircle, Clock, Info, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import type { NotificationType } from '../types';

const NOTIFICATION_ICONS: Record<NotificationType, React.ElementType> = {
  deadline: AlertCircle,
  reminder: Clock,
  info: Info,
  success: Check,
  warning: AlertTriangle,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  deadline: 'var(--color-error)',
  reminder: 'var(--color-primary-600)',
  info: 'var(--color-primary-600)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
};

export function NotificationCenter() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    requestPermission,
    hasPermission,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markAsRead(notification.id);
    if (notification.ideaId) {
      navigate(`/idea/${notification.ideaId}`);
      setIsOpen(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="icon-btn relative"
        title="알림"
        aria-label={`알림 ${unreadCount > 0 ? `(${unreadCount}개 읽지 않음)` : ''}`}
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex items-center justify-center text-xs font-bold text-white rounded-full"
            style={{
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
              backgroundColor: 'var(--color-error)',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 rounded-xl shadow-lg overflow-hidden z-50"
          style={{
            width: '360px',
            maxWidth: 'calc(100vw - 32px)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-dialog-title"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4"
            style={{ borderBottom: '1px solid var(--border-default)' }}
          >
            <h3 id="notification-dialog-title" className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              알림
            </h3>
            <div className="flex items-center gap-2">
              {!hasPermission && (
                <button
                  onClick={requestPermission}
                  className="text-xs px-2 py-1 rounded transition-colors"
                  style={{
                    backgroundColor: 'var(--color-primary-100)',
                    color: 'var(--color-primary-600)',
                  }}
                >
                  브라우저 알림 허용
                </button>
              )}
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="모두 읽음 표시"
                    aria-label="모두 읽음 표시"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <CheckCheck className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={clearAll}
                    className="p-1.5 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="모두 삭제"
                    aria-label="모두 삭제"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: '400px' }}
            role="list"
            aria-live="polite"
          >
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  알림이 없습니다
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = NOTIFICATION_ICONS[notification.type];
                const color = NOTIFICATION_COLORS[notification.type];

                return (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 p-4 transition-colors cursor-pointer"
                    style={{
                      backgroundColor: notification.read ? 'transparent' : 'var(--bg-subtle)',
                      borderBottom: '1px solid var(--border-default)',
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Icon */}
                    <div
                      className="flex-shrink-0 p-2 rounded-full"
                      style={{ backgroundColor: `${color}20` }}
                      aria-hidden="true"
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {notification.title}
                      </p>
                      <p
                        className="text-sm mt-0.5 line-clamp-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {notification.message}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="flex-shrink-0 p-1 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="삭제"
                      aria-label={`"${notification.title}" 알림 삭제`}
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
