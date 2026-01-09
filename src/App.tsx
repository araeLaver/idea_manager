import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RouteErrorBoundary } from './components/RouteErrorBoundary';
import { Layout } from './components/Layout';
import { IdeaList } from './pages/IdeaList';
import { IdeaDetail } from './pages/IdeaDetail';
import { IdeaForm } from './pages/IdeaForm';
import { SearchPage } from './pages/SearchPage';
import { KanbanBoard } from './pages/KanbanBoard';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { DailyMemos } from './pages/DailyMemos';
import { Profile } from './pages/Profile';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Statistics } from './pages/Statistics';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';

// Wrapper component for route-level error boundaries
function RouteWithErrorBoundary({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <RouteErrorBoundary routeKey={location.pathname}>
      {children}
    </RouteErrorBoundary>
  );
}

// Routes for authenticated users and guests
function ProtectedRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<RouteWithErrorBoundary><Dashboard /></RouteWithErrorBoundary>} />
        <Route path="ideas" element={<RouteWithErrorBoundary><IdeaList /></RouteWithErrorBoundary>} />
        <Route path="kanban" element={<RouteWithErrorBoundary><KanbanBoard /></RouteWithErrorBoundary>} />
        <Route path="history" element={<RouteWithErrorBoundary><History /></RouteWithErrorBoundary>} />
        <Route path="idea/:id" element={<RouteWithErrorBoundary><IdeaDetail /></RouteWithErrorBoundary>} />
        <Route path="new" element={<RouteWithErrorBoundary><IdeaForm /></RouteWithErrorBoundary>} />
        <Route path="edit/:id" element={<RouteWithErrorBoundary><IdeaForm /></RouteWithErrorBoundary>} />
        <Route path="search" element={<RouteWithErrorBoundary><SearchPage /></RouteWithErrorBoundary>} />
        <Route path="memos" element={<RouteWithErrorBoundary><DailyMemos /></RouteWithErrorBoundary>} />
        <Route path="statistics" element={<RouteWithErrorBoundary><Statistics /></RouteWithErrorBoundary>} />
        <Route path="profile" element={<RouteWithErrorBoundary><Profile /></RouteWithErrorBoundary>} />
      </Route>
      {/* Redirect any other path to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Routes for unauthenticated users
function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* Redirect any other path to the landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppRoutes() {
  const { isAuthenticated, isGuest, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-default)', color: 'var(--text-primary)' }}>
        Loading application...
      </div>
    );
  }

  return isAuthenticated || isGuest ? <ProtectedRoutes /> : <PublicRoutes />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <AuthProvider>
              <DataProvider>
                <NotificationProvider>
                  <AppRoutes />
                </NotificationProvider>
              </DataProvider>
            </AuthProvider>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
