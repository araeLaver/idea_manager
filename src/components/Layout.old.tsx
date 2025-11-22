import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PlusCircle, Lightbulb, Search, Moon, Sun, Kanban, Grid3X3, BarChart3, History, Calendar, LogOut, User, UserPlus, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { AIAssistant } from './AIAssistant';
import { useState } from 'react';

export function Layout() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isGuest } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="min-h-screen bg-primary transition-colors">
      <header className="bg-tertiary border-b border-primary backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Lightbulb className="h-8 w-8 text-accent transition-all group-hover:text-primary-400 group-hover:drop-shadow-glow" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-primary bg-gradient-hero bg-clip-text text-transparent">
                  아이디어 매니저
                </span>
              </div>
            </Link>
            
            {/* Navigation Menu */}
            <div className="hidden md:flex items-center space-x-1 mr-4">
              <Link
                to="/"
                className={`flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === '/'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-primary hover:text-white hover:bg-primary/90 border border-primary/20 hover:border-primary'
                }`}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                대시보드
              </Link>
              <Link
                to="/ideas"
                className={`flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === '/ideas'
                    ? 'bg-info text-white shadow-md'
                    : 'text-info hover:text-white hover:bg-info/90 border border-info/20 hover:border-info'
                }`}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                목록
              </Link>
              <Link
                to="/kanban"
                className={`flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === '/kanban'
                    ? 'bg-success text-white shadow-md'
                    : 'text-success hover:text-white hover:bg-success/90 border border-success/20 hover:border-success'
                }`}
              >
                <Kanban className="h-4 w-4 mr-2" />
                칸반
              </Link>
              <Link
                to="/memos"
                className={`flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === '/memos'
                    ? 'bg-warning text-white shadow-md'
                    : 'text-warning hover:text-white hover:bg-warning/90 border border-warning/20 hover:border-warning'
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                일일메모
              </Link>
              <Link
                to="/history"
                className={`flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === '/history'
                    ? 'bg-error text-white shadow-md'
                    : 'text-error hover:text-white hover:bg-error/90 border border-error/20 hover:border-error'
                }`}
              >
                <History className="h-4 w-4 mr-2" />
                히스토리
              </Link>
            </div>
            
            <nav className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="btn-ghost p-2 rounded-xl hover:bg-hover transition-all group"
                title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 transition-transform group-hover:rotate-12" />
                ) : (
                  <Sun className="h-5 w-5 transition-transform group-hover:rotate-180 text-amber-400" />
                )}
              </button>
              
              <Link 
                to="/search" 
                className="btn-ghost p-2 rounded-xl hover:bg-hover transition-all group"
                title="검색"
              >
                <Search className="h-5 w-5 transition-transform group-hover:scale-110" />
              </Link>
              
              <Link
                to="/new"
                className="btn btn-primary ml-2 shadow-glow hover:shadow-xl transition-all group"
                title="새 아이디어"
              >
                <PlusCircle className="h-5 w-5 mr-2 transition-transform group-hover:rotate-180" />
                <span className="font-semibold">새 아이디어</span>
              </Link>

              {/* User menu */}
              <div className="flex items-center ml-4 pl-4 border-l border-primary/20">
                {user ? (
                  <>
                    <div className="flex items-center text-sm text-secondary mr-3">
                      <User className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">{user.name}</span>
                    </div>
                    <button
                      onClick={logout}
                      className="btn-ghost p-2 rounded-xl hover:bg-hover transition-all group text-error"
                      title="로그아웃"
                    >
                      <LogOut className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="btn btn-primary text-sm"
                  >
                    <User className="h-4 w-4 mr-1" />
                    로그인
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Guest Mode Banner */}
      {isGuest && showBanner && (
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <UserPlus className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    게스트 모드로 이용 중입니다. 데이터는 이 브라우저에만 저장됩니다.
                  </p>
                  <p className="text-xs opacity-90 mt-0.5">
                    계정을 만들면 모든 기기에서 데이터를 동기화할 수 있습니다.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  회원가입
                </button>
                <button
                  onClick={() => setShowBanner(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title="닫기"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <Outlet />
      </main>
      
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}