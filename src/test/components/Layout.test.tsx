import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Mock AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    isAuthenticated: false,
    isGuest: true,
    sessionExpired: false,
    logout: vi.fn(),
    continueAsGuest: vi.fn(),
    clearSessionExpired: vi.fn(),
  }),
}));

// Mock DataContext
vi.mock('../../contexts/DataContext', () => ({
  DataProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useData: () => ({
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
  }),
}));

// Mock keyboard shortcuts hook
vi.mock('../../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn(),
}));

// Mock Tutorial component
vi.mock('../../components/Tutorial', () => ({
  Tutorial: () => null,
}));

const renderLayout = () => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <Layout />
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render header with logo', () => {
    renderLayout();

    // 로고 텍스트 확인 (sm:block으로 숨겨져 있을 수 있음)
    expect(screen.getByText('아이디어 매니저')).toBeInTheDocument();
  });

  it('should render navigation items', () => {
    renderLayout();

    // 네비게이션 메뉴 확인 (hidden md:flex이지만 DOM에는 존재함)
    expect(screen.getByText('대시보드')).toBeInTheDocument();
    expect(screen.getByText('아이디어')).toBeInTheDocument();
    expect(screen.getByText('칸반')).toBeInTheDocument();
    expect(screen.getByText('메모')).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    renderLayout();

    // 검색 버튼
    expect(screen.getByTitle('검색')).toBeInTheDocument();
    // 테마 토글 버튼
    expect(screen.getByTitle(/다크 모드|라이트 모드/)).toBeInTheDocument();
    // 새 아이디어 버튼 (hidden sm:flex이지만 DOM에 존재)
    expect(screen.getByText('새 아이디어')).toBeInTheDocument();
  });

  it('should toggle theme when theme button is clicked', () => {
    renderLayout();

    const themeButton = screen.getByTitle(/다크 모드|라이트 모드/);
    const initialTitle = themeButton.getAttribute('title');

    fireEvent.click(themeButton);

    // 테마 버튼의 title이 변경되어야 함
    const newTitle = screen.getByTitle(/다크 모드|라이트 모드/).getAttribute('title');
    expect(newTitle).not.toBe(initialTitle);
  });

  it('should have tour button for guests', () => {
    renderLayout();

    // 게스트 모드에서는 둘러보기 버튼이 표시됨
    const tourButton = screen.getByTitle('둘러보기');
    expect(tourButton).toBeInTheDocument();
  });

  it('should render guest exit button', () => {
    renderLayout();

    // 게스트 종료 버튼 확인
    expect(screen.getByText('게스트 종료')).toBeInTheDocument();
  });

  it('should have navigation links with correct paths', () => {
    renderLayout();

    const dashboardLink = screen.getByText('대시보드').closest('a');
    const ideasLink = screen.getByText('아이디어').closest('a');
    const kanbanLink = screen.getByText('칸반').closest('a');

    expect(dashboardLink).toHaveAttribute('href', '/');
    expect(ideasLink).toHaveAttribute('href', '/ideas');
    expect(kanbanLink).toHaveAttribute('href', '/kanban');
  });

  it('should display guest banner', () => {
    renderLayout();

    expect(screen.getByText(/게스트 모드로 이용 중/)).toBeInTheDocument();
    expect(screen.getByText('회원가입')).toBeInTheDocument();
  });
});
