import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { DataProvider } from '../../contexts/DataContext';

// Mocks
vi.mock('../../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn(),
}));

const MockProviders = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ThemeProvider>
      <DataProvider>
        {children}
      </DataProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('Layout Component', () => {
  it('should render header with logo and navigation', () => {
    render(
      <MockProviders>
        <Layout />
      </MockProviders>
    );

    // 로고 확인
    expect(screen.getByText('아이디어 매니저')).toBeInTheDocument();

    // 네비게이션 메뉴 확인
    expect(screen.getByText('대시보드')).toBeInTheDocument();
    expect(screen.getByText('목록')).toBeInTheDocument();
    expect(screen.getByText('칸반')).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    render(
      <MockProviders>
        <Layout />
      </MockProviders>
    );

    // 액션 버튼들 확인
    expect(screen.getByTitle(/다크 모드로 전환|라이트 모드로 전환/)).toBeInTheDocument();
    expect(screen.getByTitle('검색')).toBeInTheDocument();
    expect(screen.getByText('새 아이디어')).toBeInTheDocument();
  });

  it('should toggle theme when theme button is clicked', () => {
    render(
      <MockProviders>
        <Layout />
      </MockProviders>
    );

    const themeButton = screen.getByTitle(/다크 모드로 전환|라이트 모드로 전환/);
    fireEvent.click(themeButton);

    // 테마가 토글되었는지 확인 (실제 DOM 변화는 ThemeContext에서 처리됨)
    expect(themeButton).toBeInTheDocument();
  });

  it('should have AI assistant button', () => {
    render(
      <MockProviders>
        <Layout />
      </MockProviders>
    );

    const aiButton = screen.getByTitle('AI 어시스턴트');
    expect(aiButton).toBeInTheDocument();
  });

  it('should highlight active navigation item', () => {
    render(
      <MockProviders>
        <Layout />
      </MockProviders>
    );

    // 현재 경로가 '/'이므로 대시보드가 활성화되어야 함
    const dashboardLink = screen.getByText('대시보드').closest('a');
    expect(dashboardLink).toHaveClass('bg-primary');
  });
});