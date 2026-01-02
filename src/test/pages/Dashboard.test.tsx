import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../../pages/Dashboard';
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
  }),
}));

// Mock DataContext
vi.mock('../../contexts/DataContext', () => ({
  useData: () => ({
    ideas: [
      {
        id: '1',
        title: '테스트 아이디어',
        description: '설명',
        category: '기술',
        priority: 'high',
        status: 'in-progress',
        tags: ['test'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    memos: [],
    stats: {
      total: 1,
      completed: 0,
      inProgress: 1,
      draft: 0,
      archived: 0,
      highPriority: 1,
      completionRate: 0,
      topCategories: [{ category: '기술', count: 1 }],
      topTags: [{ tag: 'test', count: 1 }],
    },
    loading: false,
    error: null,
    refreshData: vi.fn(),
  }),
}));

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  Pie: () => <div data-testid="pie" />,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dashboard component without errors', () => {
    renderDashboard();
    expect(document.body).toBeInTheDocument();
  });

  it('should display hero section with title', () => {
    renderDashboard();

    // 히어로 섹션에 아이디어 매니저 제목이 있는지 확인
    expect(screen.getByText('아이디어 매니저')).toBeInTheDocument();
    // 총 아이디어 표시 (여러 곳에 있으므로 getAllBy 사용)
    expect(screen.getAllByText('총 아이디어').length).toBeGreaterThan(0);
  });

  it('should display recent activity section', () => {
    renderDashboard();

    // 최근 활동 섹션 확인
    expect(screen.getByText('최근 활동')).toBeInTheDocument();
    // 테스트 아이디어가 표시되는지 확인
    expect(screen.getByText('테스트 아이디어')).toBeInTheDocument();
  });

  it('should render charts', () => {
    renderDashboard();

    // recharts가 mock되어 있으므로 testid로 확인
    expect(screen.getAllByTestId('responsive-container').length).toBeGreaterThan(0);
  });
});
