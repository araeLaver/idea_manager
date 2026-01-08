import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface UseKeyboardShortcutsOptions {
  onNewIdea?: () => void;
  onSearch?: () => void;
  onToggleModal?: () => void;
  onShowHelp?: () => void;
  onExport?: () => void;
  enabled?: boolean;
}

export interface ShortcutInfo {
  keys: string[];
  description: string;
  category: 'navigation' | 'action' | 'general';
}

export const SHORTCUTS: ShortcutInfo[] = [
  // Navigation
  { keys: ['1'], description: '대시보드', category: 'navigation' },
  { keys: ['2'], description: '아이디어 목록', category: 'navigation' },
  { keys: ['3'], description: '칸반 보드', category: 'navigation' },
  { keys: ['4'], description: '메모', category: 'navigation' },
  { keys: ['5'], description: '통계', category: 'navigation' },
  { keys: ['6'], description: '히스토리', category: 'navigation' },
  { keys: ['G', 'D'], description: '대시보드로 이동', category: 'navigation' },
  { keys: ['G', 'L'], description: '아이디어 목록으로 이동', category: 'navigation' },
  { keys: ['G', 'K'], description: '칸반으로 이동', category: 'navigation' },
  { keys: ['G', 'S'], description: '통계로 이동', category: 'navigation' },
  { keys: ['G', 'H'], description: '히스토리로 이동', category: 'navigation' },
  { keys: ['G', 'M'], description: '메모로 이동', category: 'navigation' },
  // Actions
  { keys: ['Ctrl', 'N'], description: '새 아이디어', category: 'action' },
  { keys: ['Ctrl', 'K'], description: '검색', category: 'action' },
  { keys: ['Ctrl', 'E'], description: '내보내기/가져오기', category: 'action' },
  // General
  { keys: ['Ctrl', 'D'], description: '다크모드 전환', category: 'general' },
  { keys: ['Ctrl', '/'], description: '단축키 도움말', category: 'general' },
  { keys: ['Esc'], description: '모달 닫기', category: 'general' },
];

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const { enabled = true, onNewIdea, onSearch, onToggleModal, onShowHelp, onExport } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // 입력 요소에서는 단축키 비활성화 (Escape, Ctrl+/ 제외)
    const target = event.target as HTMLElement;
    const isInInput =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true';

    const isCtrlOrCmd = event.ctrlKey || event.metaKey;

    // Escape는 항상 동작
    if (event.key === 'Escape') {
      if (onToggleModal) {
        onToggleModal();
      }
      return;
    }

    // Ctrl+/ 도움말은 항상 동작
    if (isCtrlOrCmd && event.key === '/') {
      event.preventDefault();
      if (onShowHelp) {
        onShowHelp();
      }
      return;
    }

    // 입력 중이면 나머지 단축키 비활성화
    if (isInInput) return;

    // Ctrl/Cmd + N: 새 아이디어
    if (isCtrlOrCmd && event.key === 'n') {
      event.preventDefault();
      if (onNewIdea) {
        onNewIdea();
      } else {
        navigate('/new');
      }
    }

    // Ctrl/Cmd + K: 검색
    else if (isCtrlOrCmd && event.key === 'k') {
      event.preventDefault();
      if (onSearch) {
        onSearch();
      } else {
        navigate('/search');
      }
    }

    // Ctrl/Cmd + E: 내보내기/가져오기
    else if (isCtrlOrCmd && event.key === 'e') {
      event.preventDefault();
      if (onExport) {
        onExport();
      }
    }

    // Ctrl/Cmd + D: 다크모드 토글
    else if (isCtrlOrCmd && event.key === 'd') {
      event.preventDefault();
      toggleTheme();
    }

    // 숫자 키 1-6: 페이지 네비게이션
    else if (!isCtrlOrCmd && ['1', '2', '3', '4', '5', '6'].includes(event.key)) {
      event.preventDefault();
      switch (event.key) {
        case '1':
          navigate('/');
          break;
        case '2':
          navigate('/ideas');
          break;
        case '3':
          navigate('/kanban');
          break;
        case '4':
          navigate('/memos');
          break;
        case '5':
          navigate('/statistics');
          break;
        case '6':
          navigate('/history');
          break;
      }
    }

    // G + 키: Gmail 스타일 네비게이션
    else if (!isCtrlOrCmd && event.key === 'g') {
      const handleSecondKey = (secondEvent: KeyboardEvent) => {
        secondEvent.preventDefault();
        switch (secondEvent.key) {
          case 'd':
            navigate('/');
            break;
          case 'l':
            navigate('/ideas');
            break;
          case 'k':
            navigate('/kanban');
            break;
          case 's':
            navigate('/statistics');
            break;
          case 'h':
            navigate('/history');
            break;
          case 'm':
            navigate('/memos');
            break;
        }
        document.removeEventListener('keydown', handleSecondKey);
      };

      document.addEventListener('keydown', handleSecondKey);

      // 2초 후 이벤트 리스너 제거
      setTimeout(() => {
        document.removeEventListener('keydown', handleSecondKey);
      }, 2000);
    }
  }, [enabled, navigate, toggleTheme, onNewIdea, onSearch, onToggleModal, onShowHelp, onExport]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}