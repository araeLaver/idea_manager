import { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, Info } from 'lucide-react';

type ConfirmVariant = 'danger' | 'warning' | 'info';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: 'var(--color-error-100)',
    iconColor: 'var(--color-error-600)',
    confirmClass: 'btn btn-danger',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'var(--color-warning-100)',
    iconColor: 'var(--color-warning-600)',
    confirmClass: 'btn btn-primary',
  },
  info: {
    icon: Info,
    iconBg: 'var(--color-info-100)',
    iconColor: 'var(--color-info-600)',
    confirmClass: 'btn btn-primary',
  },
};

export function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'danger',
  loading = false,
}: ConfirmModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus management and keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    // Focus cancel button when modal opens
    cancelButtonRef.current?.focus();

    // Handle Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const config = variantConfig[variant];
  const Icon = config.icon;

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="card animate-fade-in"
        style={{ padding: 'var(--space-6)', maxWidth: '400px', width: '100%' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="p-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: config.iconBg }}
            aria-hidden="true"
          >
            <Icon className="w-5 h-5" style={{ color: config.iconColor }} />
          </div>
          <h3
            id="confirm-modal-title"
            className="text-lg font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h3>
        </div>
        <p
          id="confirm-modal-description"
          className="mb-6"
          style={{ color: 'var(--text-secondary)' }}
        >
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={config.confirmClass}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="spinner" style={{ width: '1rem', height: '1rem' }} aria-hidden="true" />
                처리 중...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
