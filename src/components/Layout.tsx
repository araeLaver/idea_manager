import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Lightbulb, LayoutGrid, Calendar, History, Search, Plus, User, LogOut, UserPlus, X, Moon, Sun, Menu, HelpCircle, Keyboard, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect, useCallback } from 'react';
import { Tutorial } from './Tutorial';
import { AIAssistant } from './AIAssistant';
import { AIBrainstorm } from './AIBrainstorm';
import { PageTransition } from './PageTransition';
import { PWAPrompt } from './PWAPrompt';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { ExportImport } from './ExportImport';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export function Layout() {
  const { user, logout, isGuest } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [runTutorial, setRunTutorial] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);

  // 키보드 단축키 핸들러
  const handleShowHelp = useCallback(() => {
    setShowShortcutsHelp((prev) => !prev);
  }, []);

  const handleExport = useCallback(() => {
    setShowExportImport(true);
  }, []);

  const handleCloseModals = useCallback(() => {
    setShowShortcutsHelp(false);
    setShowExportImport(false);
    setMobileMenuOpen(false);
  }, []);

  // 키보드 단축키 훅
  useKeyboardShortcuts({
    onShowHelp: handleShowHelp,
    onExport: handleExport,
    onToggleModal: handleCloseModals,
  });

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
    { path: '/statistics', icon: BarChart3, label: '통계', id: 'nav-statistics' },
    { path: '/history', icon: History, label: '히스토리', id: 'nav-history' },
  ];

  return (
    <div className="app-container">
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="skip-link"
        style={{
          position: 'absolute',
          top: '-100%',
          left: '0',
          backgroundColor: 'var(--color-primary-600)',
          color: 'white',
          padding: 'var(--space-3) var(--space-4)',
          zIndex: 100,
          transition: 'top 0.2s',
        }}
        onFocus={(e) => (e.currentTarget.style.top = '0')}
        onBlur={(e) => (e.currentTarget.style.top = '-100%')}
      >
        본문 바로가기
      </a>

      {/* Header */}
      <header className="header" role="banner">
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
            <nav className="hidden md:flex items-center gap-1" aria-label="주 메뉴">
              {navItems.map(({ path, icon: Icon, label, id }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    id={id}
                    className="nav-link"
                    aria-current={isActive ? 'page' : undefined}
                    style={{
                      backgroundColor: isActive ? 'var(--bg-subtle)' : 'transparent',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
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
                  aria-label="둘러보기 시작"
                  id="btn-tour"
                >
                  <HelpCircle className="w-5 h-5" aria-hidden="true" />
                </button>
              )}

              {/* Keyboard Shortcuts */}
              <button
                onClick={() => setShowShortcutsHelp(true)}
                className="icon-btn hidden sm:flex"
                title="키보드 단축키 (Ctrl+/)"
                aria-label="키보드 단축키 보기"
                id="btn-shortcuts"
              >
                <Keyboard className="w-5 h-5" aria-hidden="true" />
              </button>

              {/* Search */}
              <button
                onClick={() => navigate('/search')}
                className="icon-btn"
                title="검색 (Ctrl+K)"
                aria-label="검색 페이지로 이동"
                id="btn-search"
              >
                <Search className="w-5 h-5" aria-hidden="true" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="icon-btn"
                title={theme === 'light' ? '다크 모드' : '라이트 모드'}
                aria-label={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
                id="btn-theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Sun className="w-5 h-5" aria-hidden="true" />
                )}
              </button>

              {/* New Idea Button */}
              <button
                onClick={() => navigate('/new')}
                className="btn btn-primary hidden sm:flex"
                style={{ padding: 'var(--space-2) var(--space-4)' }}
                id="btn-new-idea"
                aria-label="새 아이디어 작성"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>새 아이디어</span>
              </button>

              {/* Mobile New Idea */}
              <button
                onClick={() => navigate('/new')}
                className="icon-btn sm:hidden"
                aria-label="새 아이디어 작성"
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'white',
                }}
              >
                <Plus className="w-5 h-5" aria-hidden="true" />
              </button>

              {/* User Section */}
              {user ? (
                <div
                  className="hidden sm:flex items-center gap-3 ml-2 pl-3"
                  style={{ borderLeft: '1px solid var(--border-default)' }}
                >
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 transition-opacity hover:opacity-80"
                    title="프로필 관리"
                    aria-label={`${user.name} 프로필 관리`}
                  >
                    <div className="avatar" style={{ width: '2rem', height: '2rem', fontSize: 'var(--text-xs)' }} aria-hidden="true">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {user.name}
                    </span>
                  </Link>
                  <button
                    onClick={logout}
                    className="icon-btn"
                    title="로그아웃"
                    aria-label="로그아웃"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              ) : isGuest ? (
                <button
                  onClick={logout}
                  className="btn btn-secondary hidden sm:flex"
                  style={{ padding: 'var(--space-2) var(--space-4)' }}
                  title="게스트 모드를 종료하고 메인 페이지로 이동합니다"
                  aria-label="게스트 모드 종료"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span>게스트 종료</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="btn btn-secondary hidden sm:flex"
                  style={{ padding: 'var(--space-2) var(--space-4)' }}
                  aria-label="로그인"
                >
                  <User className="w-4 h-4" aria-hidden="true" />
                  <span>로그인</span>
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="icon-btn md:hidden"
                aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <Menu className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden"
            role="dialog"
            aria-label="모바일 메뉴"
            style={{
              borderTop: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            <div className="p-4">
              <nav className="flex flex-col gap-1" aria-label="모바일 메뉴">
                {navItems.map(({ path, icon: Icon, label }) => {
                  const isActive = location.pathname === path;
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                      aria-current={isActive ? 'page' : undefined}
                      style={{
                        backgroundColor: isActive ? 'var(--bg-subtle)' : 'transparent',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                      <span className="font-medium">{label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile User Section */}
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-default)' }}>
                {user ? (
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3"
                      aria-label={`${user.name} 프로필 관리`}
                    >
                      <div className="avatar" style={{ width: '2.5rem', height: '2.5rem' }} aria-hidden="true">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-medium block" style={{ color: 'var(--text-primary)' }}>
                          {user.name}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          프로필 관리
                        </span>
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="btn btn-ghost w-full justify-start"
                      aria-label="로그아웃"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      <span>로그아웃</span>
                    </button>
                  </div>
                ) : isGuest ? (
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="btn btn-secondary w-full"
                    aria-label="게스트 모드 종료"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    <span>게스트 종료</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="btn btn-secondary w-full"
                    aria-label="로그인"
                  >
                    <User className="w-4 h-4" aria-hidden="true" />
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
        <div className="banner banner-info" role="alert" aria-live="polite">
          <div className="page-container" style={{ padding: '0 var(--space-6)' }}>
            <div className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-3 flex-1">
                <UserPlus className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
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
                  aria-label="배너 닫기"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main id="main-content" className="page-container" role="main" tabIndex={-1}>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      {/* Tutorial */}
      <Tutorial run={runTutorial} onFinish={() => setRunTutorial(false)} />

      {/* AI Floating Buttons */}
      <AIAssistant />
      <AIBrainstorm />

      {/* PWA Install Prompt */}
      <PWAPrompt />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />

      {/* Export/Import Modal */}
      {showExportImport && (
        <ExportImport onClose={() => setShowExportImport(false)} />
      )}
    </div>
  );
}
