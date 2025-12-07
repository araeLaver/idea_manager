import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Lightbulb, LayoutGrid, Calendar, History, Search, Plus, User, LogOut, UserPlus, X, Moon, Sun, Menu, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { Tutorial } from './Tutorial';

export function Layout() {
  const { user, logout, isGuest } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [runTutorial, setRunTutorial] = useState(false);

  // 비회원 첫 진입 시 자동 튜토리얼 시작
  useEffect(() => {
    if (isGuest && location.pathname === '/') {
      const shouldShowTutorial = localStorage.getItem('showTutorial');
      if (shouldShowTutorial === 'true') {
        localStorage.removeItem('showTutorial');
        // 페이지 렌더링 후 튜토리얼 시작
        setTimeout(() => setRunTutorial(true), 500);
      }
    }
  }, [isGuest, location.pathname]);

  const navItems = [
    { path: '/', icon: Home, label: '대시보드', id: 'nav-dashboard' },
    { path: '/ideas', icon: Lightbulb, label: '아이디어', id: 'nav-ideas' },
    { path: '/kanban', icon: LayoutGrid, label: '칸반', id: 'nav-kanban' },
    { path: '/memos', icon: Calendar, label: '메모', id: 'nav-memos' },
    { path: '/history', icon: History, label: '히스토리', id: 'nav-history' },
  ];

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="page-container" style={{ padding: '0 var(--space-6)' }}>
          <div className="flex items-center justify-between" style={{ height: '4rem' }}>
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 transition-colors"
              style={{ textDecoration: 'none' }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--gradient-primary)',
                }}
              >
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <span
                className="text-lg font-bold hidden sm:block"
                style={{ color: 'var(--text-primary)' }}
              >
                아이디어 매니저
              </span>
            </Link>

            {/* Center Navigation - Desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ path, icon: Icon, label, id }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    id={id}
                    className="nav-link"
                    style={{
                      backgroundColor: isActive ? 'var(--bg-subtle)' : 'transparent',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Tour Button - Guest Only */}
              {isGuest && (
                <button
                  onClick={() => {
                    if (location.pathname !== '/') {
                      navigate('/');
                    }
                    setTimeout(() => setRunTutorial(true), 100);
                  }}
                  className="icon-btn"
                  title="둘러보기"
                  id="btn-tour"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              )}

              {/* Search */}
              <button
                onClick={() => navigate('/search')}
                className="icon-btn"
                title="검색"
                id="btn-search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="icon-btn"
                title={theme === 'light' ? '다크 모드' : '라이트 모드'}
                id="btn-theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>

              {/* New Idea Button */}
              <button
                onClick={() => navigate('/new')}
                className="btn btn-primary hidden sm:flex"
                style={{ padding: 'var(--space-2) var(--space-4)' }}
                id="btn-new-idea"
              >
                <Plus className="w-4 h-4" />
                <span>새 아이디어</span>
              </button>

              {/* Mobile New Idea */}
              <button
                onClick={() => navigate('/new')}
                className="icon-btn sm:hidden"
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'white',
                }}
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* User Section */}
              {user ? (
                <div
                  className="hidden sm:flex items-center gap-3 ml-2 pl-3"
                  style={{ borderLeft: '1px solid var(--border-default)' }}
                >
                  <div className="avatar" style={{ width: '2rem', height: '2rem', fontSize: 'var(--text-xs)' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {user.name}
                  </span>
                  <button
                    onClick={logout}
                    className="icon-btn"
                    title="로그아웃"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="btn btn-secondary hidden sm:flex"
                  style={{ padding: 'var(--space-2) var(--space-4)' }}
                >
                  <User className="w-4 h-4" />
                  <span>로그인</span>
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="icon-btn md:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden"
            style={{
              borderTop: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            <div className="p-4">
              <nav className="flex flex-col gap-1">
                {navItems.map(({ path, icon: Icon, label }) => {
                  const isActive = location.pathname === path;
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                      style={{
                        backgroundColor: isActive ? 'var(--bg-subtle)' : 'transparent',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile User Section */}
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-default)' }}>
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="avatar" style={{ width: '2.5rem', height: '2.5rem' }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {user.name}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="btn btn-ghost"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>로그아웃</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="btn btn-secondary w-full"
                  >
                    <User className="w-4 h-4" />
                    <span>로그인</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Guest Banner */}
      {isGuest && showBanner && (
        <div className="banner banner-info">
          <div className="page-container" style={{ padding: '0 var(--space-6)' }}>
            <div className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-3 flex-1">
                <UserPlus className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">
                  게스트 모드로 이용 중입니다. 데이터는 이 브라우저에만 저장됩니다.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/register')}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: 'white',
                    color: 'var(--color-primary-600)',
                    padding: 'var(--space-2) var(--space-4)',
                  }}
                >
                  회원가입
                </button>
                <button
                  onClick={() => setShowBanner(false)}
                  className="p-1 rounded transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="page-container">
        <Outlet />
      </main>

      {/* Tutorial */}
      <Tutorial run={runTutorial} onFinish={() => setRunTutorial(false)} />
    </div>
  );
}
