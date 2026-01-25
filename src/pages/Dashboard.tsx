import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, Target, Lightbulb, Star,
  ArrowUp, ArrowDown, Minus,
  Edit3, Save, History, Plus, ArrowRight
} from 'lucide-react';
import type { Idea, IdeaStatus } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useMemo, memo } from 'react';
import { getStatusLabel, getStatusClass } from '../utils/labelMappings';
import { SkeletonDashboard } from '../components/Skeleton';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  gradient: string;
}

const StatsCard = memo(function StatsCard({ title, value, change, icon, gradient }: StatsCardProps) {
  return (
    <div className="stats-card">
      <div className="flex items-start justify-between mb-4">
        <div
          className="flex items-center justify-center"
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: 'var(--radius-lg)',
            background: gradient,
          }}
        >
          <div style={{ color: 'white' }}>{icon}</div>
        </div>
        {change !== undefined && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: change > 0 ? 'var(--color-success-50)' :
                              change < 0 ? 'var(--color-error-50)' : 'var(--bg-subtle)',
              color: change > 0 ? 'var(--color-success-600)' :
                    change < 0 ? 'var(--color-error-600)' : 'var(--text-tertiary)',
            }}
          >
            {change > 0 ? <ArrowUp className="w-3 h-3" /> :
             change < 0 ? <ArrowDown className="w-3 h-3" /> :
             <Minus className="w-3 h-3" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </p>
      <p className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  );
});

const RecentActivity = memo(function RecentActivity({ ideas }: { ideas: Idea[] }) {
  const recentIdeas = useMemo(() =>
    [...ideas]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5),
    [ideas]
  );

  return (
    <div className="card" style={{ padding: 'var(--space-6)' }}>
      <div className="section-header">
        <div className="section-icon">
          <History className="w-5 h-5" />
        </div>
        <h3 className="section-title">최근 활동</h3>
      </div>

      {recentIdeas.length > 0 ? (
        <div className="flex flex-col gap-2">
          {recentIdeas.map((idea) => (
            <Link
              key={idea.id}
              to={`/idea/${idea.id}`}
              className="flex items-center gap-3 p-3 rounded-lg transition-colors"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {idea.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${getStatusClass(idea.status as IdeaStatus)}`}>
                    {getStatusLabel(idea.status as IdeaStatus)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {format(new Date(idea.updatedAt), 'MM.dd HH:mm', { locale: ko })}
                  </span>
                </div>
              </div>
              <span className="tag">{idea.category}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
          <Lightbulb className="empty-state-icon" />
          <p className="empty-state-title">활동 내역이 없습니다</p>
          <p className="empty-state-description">첫 번째 아이디어를 추가해보세요</p>
          <Link to="/new" className="btn btn-primary">
            <Plus className="w-4 h-4" />
            <span>아이디어 추가</span>
          </Link>
        </div>
      )}
    </div>
  );
});

function DailyMemo() {
  const [memo, setMemo] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [savedMemo, setSavedMemo] = useState('');
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const stored = localStorage.getItem(`daily-memo-${today}`);
    if (stored) {
      setSavedMemo(stored);
      setMemo(stored);
    }
  }, [today]);

  const handleSave = () => {
    localStorage.setItem(`daily-memo-${today}`, memo);
    setSavedMemo(memo);
    setIsEditing(false);
  };

  return (
    <div className="memo-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            오늘의 메모
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {format(new Date(), 'yyyy년 MM월 dd일', { locale: ko })}
          </p>
        </div>
        <div className="flex gap-1">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="icon-btn"
                style={{ color: 'var(--color-success-600)' }}
                aria-label="메모 저장"
              >
                <Save className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => { setMemo(savedMemo); setIsEditing(false); }}
                className="icon-btn"
                style={{ color: 'var(--color-error-500)' }}
                aria-label="편집 취소"
              >
                <Minus className="w-4 h-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <Link to="/memos" className="icon-btn" style={{ color: 'var(--accent-primary)' }} aria-label="메모 히스토리">
                <History className="w-4 h-4" aria-hidden="true" />
              </Link>
              <button onClick={() => setIsEditing(true)} className="icon-btn" aria-label="메모 편집">
                <Edit3 className="w-4 h-4" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="오늘 하루를 기록해보세요..."
          autoFocus
          style={{
            minHeight: '120px',
            resize: 'none',
          }}
        />
      ) : (
        <div
          className="p-3 rounded-lg"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            minHeight: '120px',
          }}
        >
          {savedMemo ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {savedMemo}
            </p>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              오늘의 메모를 작성해보세요
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const { ideas, loading } = useData();
  const { isGuest } = useAuth();

  const { totalIdeas, completedIdeas, inProgressIdeas, completionRate, highPriority } = useMemo(() => {
    const total = ideas.length;
    const completed = ideas.filter(idea => idea.status === 'completed').length;
    const inProgress = ideas.filter(idea => idea.status === 'in-progress').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const high = ideas.filter(idea => idea.priority === 'high').length;
    return { totalIdeas: total, completedIdeas: completed, inProgressIdeas: inProgress, completionRate: rate, highPriority: high };
  }, [ideas]);

  const statusData = useMemo(() => {
    if (totalIdeas === 0) return [];
    return [
      { name: '초안', value: ideas.filter(i => i.status === 'draft').length, color: '#64748b' },
      { name: '진행중', value: inProgressIdeas, color: '#3b82f6' },
      { name: '완료', value: completedIdeas, color: '#22c55e' },
      { name: '보관됨', value: ideas.filter(i => i.status === 'archived').length, color: '#f59e0b' },
    ].filter(item => item.value > 0);
  }, [ideas, totalIdeas, inProgressIdeas, completedIdeas]);

  const priorityData = useMemo(() => {
    if (totalIdeas === 0) return [];
    return [
      { name: '높음', value: highPriority, color: '#ef4444' },
      { name: '보통', value: ideas.filter(i => i.priority === 'medium').length, color: '#f59e0b' },
      { name: '낮음', value: ideas.filter(i => i.priority === 'low').length, color: '#64748b' },
    ].filter(item => item.value > 0);
  }, [ideas, totalIdeas, highPriority]);

  const categoryData = useMemo(() => {
    const stats = ideas.reduce((acc, idea) => {
      acc[idea.category] = (acc[idea.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [ideas]);

  const topTags = useMemo(() => {
    const stats = ideas.reduce((acc, idea) => {
      idea.tags.forEach(tag => { acc[tag] = (acc[tag] || 0) + 1; });
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(stats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));
  }, [ideas]);

  if (loading) {
    return <SkeletonDashboard />;
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section mb-8">
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                      아이디어 매니저
                    </h1>
                    {isGuest && (
                      <span className="badge badge-warning text-xs">게스트 모드</span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-white/80 text-lg max-w-xl">
                창의적인 아이디어를 체계적으로 관리하고 실현하세요
                {isGuest && ' (브라우저에 저장됩니다)'}
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mt-6">
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                >
                  <TrendingUp className="w-5 h-5 text-white" />
                  <div>
                    <div className="text-2xl font-bold text-white">{totalIdeas}</div>
                    <div className="text-xs text-white/70">총 아이디어</div>
                  </div>
                </div>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                >
                  <Target className="w-5 h-5 text-white" />
                  <div>
                    <div className="text-2xl font-bold text-white">{completionRate}%</div>
                    <div className="text-xs text-white/70">완료율</div>
                  </div>
                </div>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                >
                  <Star className="w-5 h-5 text-white" />
                  <div>
                    <div className="text-2xl font-bold text-white">{highPriority}</div>
                    <div className="text-xs text-white/70">높은 우선순위</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link to="/ideas" className="btn btn-secondary">
                아이디어 목록
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/new" className="btn" style={{
                backgroundColor: 'white',
                color: 'var(--color-primary-600)',
              }}>
                <Plus className="w-4 h-4" />
                새 아이디어
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="총 아이디어"
          value={totalIdeas}
          change={12}
          icon={<Lightbulb className="w-6 h-6" />}
          gradient="var(--gradient-primary)"
        />
        <StatsCard
          title="완료율"
          value={`${completionRate}%`}
          change={completedIdeas > 0 ? 8 : 0}
          icon={<Target className="w-6 h-6" />}
          gradient="var(--gradient-secondary)"
        />
        <StatsCard
          title="진행중"
          value={inProgressIdeas}
          change={5}
          icon={<TrendingUp className="w-6 h-6" />}
          gradient="linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)"
        />
        <StatsCard
          title="높은 우선순위"
          value={highPriority}
          change={-2}
          icon={<Star className="w-6 h-6" />}
          gradient="linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Status Chart */}
        <div className="chart-container" style={{ height: '400px' }}>
          <div className="section-header">
            <div className="section-icon">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="section-title">상태별 분포</h3>
          </div>

          {statusData.length > 0 ? (
            <>
              <div style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '8px',
                        boxShadow: 'var(--shadow-lg)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <Target className="empty-state-icon" />
              <p className="empty-state-description">아이디어를 추가하면 상태별 분포를 확인할 수 있습니다</p>
            </div>
          )}
        </div>

        {/* Priority Chart */}
        <div className="chart-container" style={{ height: '400px' }}>
          <div className="section-header">
            <div className="section-icon" style={{ background: 'var(--gradient-secondary)' }}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="section-title">우선순위별 분포</h3>
          </div>

          {priorityData.length > 0 ? (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" opacity={0.5} />
                  <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={12} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              <TrendingUp className="empty-state-icon" />
              <p className="empty-state-description">아이디어를 추가하면 우선순위별 분포를 확인할 수 있습니다</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentActivity ideas={ideas} />
        </div>

        <div className="flex flex-col gap-4">
          <DailyMemo />

          {/* Categories */}
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              인기 카테고리
            </h3>
            {categoryData.length > 0 ? (
              <div className="flex flex-col gap-3">
                {categoryData.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate flex-1 mr-2" style={{ color: 'var(--text-primary)' }}>
                      {category.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="progress-bar" style={{ width: '4rem' }}>
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${(category.value / Math.max(...categoryData.map(c => c.value))) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs w-6 text-right" style={{ color: 'var(--text-tertiary)' }}>
                        {category.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-tertiary)' }}>
                카테고리가 없습니다
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              인기 태그
            </h3>
            {topTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {topTags.map((tagData) => (
                  <span key={tagData.tag} className="tag">
                    {tagData.tag}
                    <span style={{ color: 'var(--text-tertiary)', marginLeft: '4px' }}>
                      ({tagData.count})
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-tertiary)' }}>
                태그가 없습니다
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
