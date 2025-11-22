import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface UseKeyboardShortcutsOptions {
  onNewIdea?: () => void;
  onSearch?: () => void;
  onToggleModal?: () => void;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 입력 요소에서는 단축키 비활성화
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      // Ctrl/Cmd + N: 새 아이디어
      if (isCtrlOrCmd && event.key === 'n') {
        event.preventDefault();
        if (options.onNewIdea) {
          options.onNewIdea();
        } else {
          navigate('/new');
        }
      }

      // Ctrl/Cmd + K: 검색 (또는 모달 토글)
      else if (isCtrlOrCmd && event.key === 'k') {
        event.preventDefault();
        if (options.onSearch) {
          options.onSearch();
        } else if (options.onToggleModal) {
          options.onToggleModal();
        } else {
          navigate('/search');
        }
      }

      // Ctrl/Cmd + D: 다크모드 토글
      else if (isCtrlOrCmd && event.key === 'd') {
        event.preventDefault();
        toggleTheme();
      }

      // Escape: 모달 닫기
      else if (event.key === 'Escape') {
        if (options.onToggleModal) {
          options.onToggleModal();
        }
      }

      // 숫자 키 1-4: 페이지 네비게이션
      else if (!isCtrlOrCmd && ['1', '2', '3', '4'].includes(event.key)) {
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
            navigate('/history');
            break;
        }
      }

      // G + D: 대시보드로 이동 (Gmail 스타일)
      else if (!isCtrlOrCmd && event.key === 'g') {
        // 다음 키 입력을 기다림
        const handleSecondKey = (secondEvent: KeyboardEvent) => {
          if (secondEvent.key === 'd') {
            navigate('/');
          } else if (secondEvent.key === 'l') {
            navigate('/ideas');
          } else if (secondEvent.key === 'k') {
            navigate('/kanban');
          } else if (secondEvent.key === 'h') {
            navigate('/history');
          }
          document.removeEventListener('keydown', handleSecondKey);
        };
        
        document.addEventListener('keydown', handleSecondKey);
        
        // 2초 후 이벤트 리스너 제거
        setTimeout(() => {
          document.removeEventListener('keydown', handleSecondKey);
        }, 2000);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, toggleTheme, options]);
}