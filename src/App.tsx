import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
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
import Login from './pages/Login';
import Register from './pages/Register';

function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes - accessible anytime */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main routes - accessible to everyone */}
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
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <DataProvider>
              <AppRoutes />
            </DataProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
