import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
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

// Routes for authenticated users and guests
function ProtectedRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="ideas" element={<IdeaList />} />
        <Route path="kanban" element={<KanbanBoard />} />
        <Route path="history" element={<History />} />
        <Route path="idea/:id" element={<IdeaDetail />} />
        <Route path="new" element={<IdeaForm />} />
        <Route path="edit/:id" element={<IdeaForm />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="memos" element={<DailyMemos />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="profile" element={<Profile />} />
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
                <AppRoutes />
              </DataProvider>
            </AuthProvider>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
