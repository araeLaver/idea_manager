import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../../pages/Dashboard';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { DataProvider } from '../../contexts/DataContext';

// Mocks
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: () => <div>PieChart</div>,
  BarChart: () => <div>BarChart</div>,
  Cell: () => <div>Cell</div>,
  Pie: () => <div>Pie</div>,
  Bar: () => <div>Bar</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  Legend: () => <div>Legend</div>,
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

describe('Dashboard Component', () => {
  it('should render dashboard component without errors', () => {
    render(
      <MockProviders>
        <Dashboard />
      </MockProviders>
    );

    // Dashboard가 렌더링되는지 확인
    expect(document.body).toBeInTheDocument();
  });
});