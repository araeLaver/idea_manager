import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Lightbulb, LayoutGrid, Calendar, History, Search, Plus, User, LogOut, UserPlus, X, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';

export function Layout() {
  const { user, logout, isGuest } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);

  const navItems = [
    { path: '/', icon: Home, label: '대시보드' },
    { path: '/ideas', icon: Lightbulb, label: '아이디어' },
    { path: '/kanban', icon: LayoutGrid, label: '칸반' },
    { path: '/memos', icon: Calendar, label: '메모' },
    { path: '/history', icon: History, label: '히스토리' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      {/* Top Navigation */}
      <header className="sticky top-0 z-50" style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)'
      }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Lightbulb className="w-6 h-6" style={{ color: 'var(--color-blue-500)' }} />
              <span className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                아이디어 매니저
              </span>
            </Link>

            {/* Center Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                    style={{
                      backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/search')}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="검색"
              >
                <Search className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={theme === 'light' ? '다크 모드' : '라이트 모드'}
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                ) : (
                  <Sun className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                )}
              </button>

              <button
                onClick={() => navigate('/new')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white relative overflow-hidden group"
                style={{
                  background: 'var(--gradient-purple-pink)',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all 0.3s var(--ease-smooth)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                새 아이디어
              </button>

              {user ? (
                <div className="flex items-center gap-2 ml-2 pl-2" style={{ borderLeft: '1px solid var(--border-default)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {user.name}
                  </span>
                  <button
                    onClick={logout}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="로그아웃"
                  >
                    <LogOut className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ml-2"
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <User className="w-4 h-4" />
                  로그인
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Guest Banner */}
      {isGuest && showBanner && (
        <div style={{ backgroundColor: 'var(--color-blue-500)', color: 'white' }}>
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <UserPlus className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    게스트 모드로 이용 중입니다. 데이터는 이 브라우저에만 저장됩니다.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-1.5 rounded-md text-sm font-semibold transition-colors"
                  style={{ backgroundColor: 'white', color: 'var(--color-blue-600)' }}
                >
                  회원가입
                </button>
                <button
                  onClick={() => setShowBanner(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
