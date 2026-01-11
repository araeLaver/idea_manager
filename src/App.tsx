import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RouteErrorBoundary } from './components/RouteErrorBoundary';
import { Layout } from './components/Layout';

// Lazy load pages for better initial bundle size
const IdeaList = lazy(() => import('./pages/IdeaList').then(m => ({ default: m.IdeaList })));
const IdeaDetail = lazy(() => import('./pages/IdeaDetail').then(m => ({ default: m.IdeaDetail })));
const IdeaForm = lazy(() => import('./pages/IdeaForm').then(m => ({ default: m.IdeaForm })));
const SearchPage = lazy(() => import('./pages/SearchPage').then(m => ({ default: m.SearchPage })));
const KanbanBoard = lazy(() => import('./pages/KanbanBoard').then(m => ({ default: m.KanbanBoard })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const History = lazy(() => import('./pages/History').then(m => ({ default: m.History })));
const DailyMemos = lazy(() => import('./pages/DailyMemos').then(m => ({ default: m.DailyMemos })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const Statistics = lazy(() => import('./pages/Statistics').then(m => ({ default: m.Statistics })));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const LandingPage = lazy(() => import('./pages/LandingPage'));

// Loading fallback component
function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', color: 'var(--text-secondary)' }}>
      Loading...
    </div>
  );
}

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
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}

// Routes for unauthenticated users
function PublicRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Redirect any other path to the landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
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
