import { X, Keyboard } from 'lucide-react';
import { SHORTCUTS } from '../hooks/useKeyboardShortcuts';
import type { ShortcutInfo } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

function ShortcutKey({ keyName }: { keyName: string }) {
  return (
    <kbd
      className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded"
      style={{
        backgroundColor: 'var(--bg-subtle)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-primary)',
        minWidth: '1.5rem',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      }}
    >
      {keyName}
    </kbd>
  );
}

function ShortcutRow({ shortcut }: { shortcut: ShortcutInfo }) {
  const isSequence = shortcut.keys.length === 2 && shortcut.keys[0] === 'G';

  return (
    <div
      className="flex items-center justify-between py-2 px-3 rounded transition-colors hover:bg-subtle"
    >
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {shortcut.description}
      </span>
      <div className="flex items-center gap-1">
        {shortcut.keys.map((key, index) => (
          <span key={index} className="flex items-center gap-1">
            <ShortcutKey keyName={key} />
            {index < shortcut.keys.length - 1 && (
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {isSequence ? '→' : '+'}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function ShortcutCategory({
  title,
  shortcuts,
}: {
  title: string;
  shortcuts: ShortcutInfo[];
}) {
  return (
    <div className="mb-4">
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-2 px-3"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {title}
      </h3>
      <div className="space-y-1">
        {shortcuts.map((shortcut, index) => (
          <ShortcutRow key={index} shortcut={shortcut} />
        ))}
      </div>
    </div>
  );
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null;

  const navigationShortcuts = SHORTCUTS.filter((s) => s.category === 'navigation');
  const actionShortcuts = SHORTCUTS.filter((s) => s.category === 'action');
  const generalShortcuts = SHORTCUTS.filter((s) => s.category === 'general');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Keyboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2
                id="shortcuts-title"
                className="text-lg font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                키보드 단축키
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                빠른 작업을 위한 단축키 모음
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-subtle"
            style={{ color: 'var(--text-tertiary)' }}
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div
          className="px-3 py-4 max-h-96 overflow-y-auto"
          style={{ scrollbarWidth: 'thin' }}
        >
          <ShortcutCategory title="페이지 이동" shortcuts={navigationShortcuts} />
          <ShortcutCategory title="기능" shortcuts={actionShortcuts} />
          <ShortcutCategory title="일반" shortcuts={generalShortcuts} />
        </div>

        {/* Footer */}
        <div
          className="px-6 py-3"
          style={{
            borderTop: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-subtle)',
          }}
        >
          <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
            <strong>팁:</strong> 입력 필드가 활성화되지 않은 상태에서 작동합니다.
            G + 키 조합은 Gmail 스타일 네비게이션입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
