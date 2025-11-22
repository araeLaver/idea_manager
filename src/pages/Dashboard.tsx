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
  Edit3, Save,
  History
} from 'lucide-react';
import type { Idea } from '../types';
import { useData } from '../contexts/DataContext';
import { useState, useEffect } from 'react';
import { Button } from '../components/Button';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: string;
}

function StatsCard({ title, value, change, icon, color }: StatsCardProps) {
  const getChangeIcon = () => {
    if (!change) return <Minus className="h-3 w-3" />;
    if (change > 0) return <ArrowUp className="h-3 w-3" />;
    if (change < 0) return <ArrowDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getChangeColor = () => {
    if (!change) return 'text-tertiary';
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-error';
    return 'text-tertiary';
  };

  // Gradient backgrounds based on card type
  const gradientMap: Record<string, string> = {
    'text-primary-600': 'var(--gradient-purple-pink)',
    'text-success': 'var(--gradient-success)',
    'text-info': 'var(--gradient-blue-cyan)',
    'text-error': 'var(--gradient-secondary)',
  };

  const gradient = gradientMap[color] || 'var(--gradient-primary)';

  return (
    <div
      className="relative overflow-hidden group"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        transition: 'all 0.3s var(--ease-smooth)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-default)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Gradient background on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
        style={{ background: gradient }}
      />

      {/* Icon with gradient background */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div
          className="p-3 rounded-lg transition-all duration-300"
          style={{
            background: gradient,
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="text-white">
            {icon}
          </div>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${getChangeColor()}`}
            style={{
              backgroundColor: change > 0 ? 'var(--color-green-50)' :
                              change < 0 ? 'var(--color-red-50)' : 'var(--bg-hover)'
            }}
          >
            {getChangeIcon()}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      <div className="space-y-1 relative z-10">
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{title}</p>
        <p className="text-3xl font-bold" style={{
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em'
        }}>{value}</p>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: gradient }}
      />
    </div>
  );
}

interface RecentActivityProps {
  ideas: Idea[];
}

function RecentActivity({ ideas }: RecentActivityProps) {
  const recentIdeas = ideas
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem'
    }}>
      <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>최근 활동</h3>

      <div className="space-y-2">
        {recentIdeas.length > 0 ? (
          recentIdeas.map((idea) => (
            <div
              key={idea.id}
              className="flex items-center gap-3 p-2.5 rounded-md transition-colors"
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div className="flex-1 min-w-0">
                <Link
                  to={`/idea/${idea.id}`}
                  className="text-sm font-medium line-clamp-1 hover:underline"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {idea.title}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded" style={{
                    backgroundColor: idea.status === 'completed' ? 'var(--color-green-50)' :
                                   idea.status === 'in-progress' ? 'var(--color-blue-50)' :
                                   idea.status === 'archived' ? 'var(--color-yellow-50)' :
                                   'var(--color-gray-100)',
                    color: idea.status === 'completed' ? 'var(--color-green-600)' :
                          idea.status === 'in-progress' ? 'var(--color-blue-600)' :
                          idea.status === 'archived' ? 'var(--color-yellow-500)' :
                          'var(--color-gray-600)'
                  }}>
                    {idea.status === 'completed' ? '완료' :
                     idea.status === 'in-progress' ? '진행중' :
                     idea.status === 'archived' ? '보관됨' : '초안'}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {format(new Date(idea.updatedAt), 'MM.dd HH:mm', { locale: ko })}
                  </span>
                </div>
              </div>
              <div className="text-xs px-2 py-1 rounded" style={{
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-secondary)'
              }}>
                {idea.category}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>활동 내역이 없습니다</p>
            <Link
              to="/new"
              className="inline-flex items-center gap-2 text-sm hover:underline"
              style={{ color: 'var(--text-link)' }}
            >
              첫 번째 아이디어를 추가해보세요
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

interface DailyMemoProps {}


function DailyMemo({}: DailyMemoProps) {
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

  const handleCancel = () => {
    setMemo(savedMemo);
    setIsEditing(false);
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem'
    }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>오늘의 메모</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {format(new Date(), 'yyyy년 MM월 dd일', { locale: ko })}
          </p>
        </div>
        <div className="flex gap-1">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-1.5 rounded hover:bg-green-50 transition-colors"
                title="저장"
                style={{ color: 'var(--color-green-600)' }}
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 rounded hover:bg-red-50 transition-colors"
                title="취소"
                style={{ color: 'var(--color-red-500)' }}
              >
                <Minus className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/memos"
                className="p-1.5 rounded hover:bg-blue-50 transition-colors"
                title="모든 메모 보기"
                style={{ color: 'var(--color-blue-600)' }}
              >
                <History className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded transition-colors"
                title="편집"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Edit3 className="h-4 w-4" />
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
          className="w-full h-32 p-3 rounded resize-none focus:outline-none text-sm"
          style={{
            border: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-page)',
            color: 'var(--text-primary)'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
          autoFocus
        />
      ) : (
        <div className="p-3 rounded min-h-[120px]" style={{ backgroundColor: 'var(--bg-hover)' }}>
          {savedMemo ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {savedMemo}
            </p>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>오늘의 메모를 작성해보세요</p>
          )}
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const { ideas, loading } = useData();

  // Calculate statistics
  const totalIdeas = ideas.length;
  const completedIdeas = ideas.filter(idea => idea.status === 'completed').length;
  const inProgressIdeas = ideas.filter(idea => idea.status === 'in-progress').length;
  const draftIdeas = ideas.filter(idea => idea.status === 'draft').length;

  // Calculate completion rate
  const completionRate = totalIdeas > 0 ? Math.round((completedIdeas / totalIdeas) * 100) : 0;

  // Priority distribution
  const highPriority = ideas.filter(idea => idea.priority === 'high').length;
  const mediumPriority = ideas.filter(idea => idea.priority === 'medium').length;
  const lowPriority = ideas.filter(idea => idea.priority === 'low').length;

  // Category distribution
  const categoryStats = ideas.reduce((acc, idea) => {
    acc[idea.category] = (acc[idea.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Status distribution for pie chart - only show if data exists
  const statusData = totalIdeas > 0 ? [
    { name: '초안', value: draftIdeas, color: '#6b7280' },
    { name: '진행중', value: inProgressIdeas, color: '#3b82f6' },
    { name: '완료', value: completedIdeas, color: '#10b981' },
    { name: '보관됨', value: ideas.filter(idea => idea.status === 'archived').length, color: '#f59e0b' },
  ].filter(item => item.value > 0) : [];

  // Priority data for bar chart - only show if data exists
  const priorityData = totalIdeas > 0 ? [
    { name: '높음', value: highPriority, color: '#ef4444' },
    { name: '보통', value: mediumPriority, color: '#f59e0b' },
    { name: '낮음', value: lowPriority, color: '#6b7280' },
  ].filter(item => item.value > 0) : [];

  // Activity over time (removed for now)

  // Top tags
  const tagStats = ideas.reduce((acc, idea) => {
    idea.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(tagStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-secondary">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div
        className="mb-8 p-8 rounded-xl relative overflow-hidden"
        style={{
          background: 'var(--gradient-hero)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Animated background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <Lightbulb className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-1" style={{ letterSpacing: '-0.02em' }}>
                    아이디어 매니저
                  </h1>
                  <p className="text-white text-opacity-90 text-base">
                    창의적인 아이디어를 체계적으로 관리하고 실현하세요
                  </p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                  <TrendingUp className="h-5 w-5 text-white" />
                  <div>
                    <div className="text-2xl font-bold text-white">{totalIdeas}+</div>
                    <div className="text-xs text-white text-opacity-80">총 아이디어</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                  <Target className="h-5 w-5 text-white" />
                  <div>
                    <div className="text-2xl font-bold text-white">{completionRate}%</div>
                    <div className="text-xs text-white text-opacity-80">완료율</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                  <Star className="h-5 w-5 text-white" />
                  <div>
                    <div className="text-2xl font-bold text-white">{highPriority}</div>
                    <div className="text-xs text-white text-opacity-80">높은 우선순위</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Link to="/ideas">
                <Button variant="primary" size="md">
                  아이디어 목록
                </Button>
              </Link>
              <Link to="/memos">
                <Button variant="secondary" size="md">
                  일일메모
                </Button>
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
          changeLabel="지난주 대비"
          icon={<Lightbulb className="h-6 w-6" />}
          color="text-primary-600"
        />
        <StatsCard
          title="완료율"
          value={`${completionRate}%`}
          change={completedIdeas > draftIdeas ? 8 : -3}
          changeLabel="지난주 대비"
          icon={<Target className="h-6 w-6" />}
          color="text-success"
        />
        <StatsCard
          title="진행중"
          value={inProgressIdeas}
          change={5}
          changeLabel="지난주 대비"
          icon={<TrendingUp className="h-6 w-6" />}
          color="text-info"
        />
        <StatsCard
          title="높은 우선순위"
          value={highPriority}
          change={-2}
          changeLabel="지난주 대비"
          icon={<Star className="h-6 w-6" />}
          color="text-error"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Status Distribution */}
        <div
          className="relative overflow-hidden group"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s var(--ease-smooth)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg" style={{ background: 'var(--gradient-primary)' }}>
              <Target className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>상태별 분포</h3>
          </div>
          {statusData.length > 0 ? (
            <>
              <div style={{ flex: 1, height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <filter id="shadow" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                        <feOffset dx="0" dy="2" result="offsetblur"/>
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.3"/>
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                      filter="url(#shadow)"
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
                      style={{
                        backgroundColor: item.color,
                        boxShadow: `0 0 8px ${item.color}50`,
                      }}
                    ></div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center" style={{ minHeight: '250px' }}>
              <div className="text-center">
                <div className="mb-3 opacity-20">
                  <Target className="h-16 w-16 mx-auto" style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  데이터가 없습니다
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  아이디어를 추가하면 상태별 분포를 확인할 수 있습니다
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Priority Distribution */}
        <div
          className="relative overflow-hidden group"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s var(--ease-smooth)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg" style={{ background: 'var(--gradient-success)' }}>
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>우선순위별 분포</h3>
          </div>
          {priorityData.length > 0 ? (
            <div style={{ flex: 1, height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" opacity={0.5} />
                  <XAxis
                    dataKey="name"
                    stroke="var(--text-tertiary)"
                    style={{ fontSize: '12px', fontWeight: 500 }}
                  />
                  <YAxis
                    stroke="var(--text-tertiary)"
                    style={{ fontSize: '12px', fontWeight: 500 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                    cursor={{ fill: 'var(--bg-hover)' }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#8884d8"
                    radius={[8, 8, 0, 0]}
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center" style={{ minHeight: '250px' }}>
              <div className="text-center">
                <div className="mb-3 opacity-20">
                  <TrendingUp className="h-16 w-16 mx-auto" style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  데이터가 없습니다
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  아이디어를 추가하면 우선순위별 분포를 확인할 수 있습니다
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 h-fit">
          <RecentActivity ideas={ideas} />
        </div>

        {/* Daily Memo & Categories & Tags */}
        <div className="space-y-4">
          {/* Daily Memo */}
          <DailyMemo />
          
          {/* Top Categories */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem'
          }}>
            <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>인기 카테고리</h3>
            <div className="space-y-3">
              {categoryData.length > 0 ? (
                categoryData.slice(0, 5).map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate flex-1 mr-2" style={{ color: 'var(--text-primary)' }}>
                      {category.name}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="h-1.5 rounded-full w-16" style={{ backgroundColor: 'var(--bg-hover)' }}>
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            backgroundColor: 'var(--color-blue-500)',
                            width: `${(category.value / Math.max(...categoryData.map(c => c.value))) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-xs w-6 text-right" style={{ color: 'var(--text-tertiary)' }}>
                        {category.value}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>카테고리가 없습니다</p>
                  <Link
                    to="/new"
                    className="text-sm hover:underline"
                    style={{ color: 'var(--text-link)' }}
                  >
                    아이디어를 추가해보세요
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Top Tags */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem'
          }}>
            <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>인기 태그</h3>
            <div className="flex flex-wrap gap-1.5">
              {topTags.length > 0 ? (
                topTags.map((tagData) => (
                  <span
                    key={tagData.tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {tagData.tag}
                    <span style={{ color: 'var(--text-tertiary)' }}>({tagData.count})</span>
                  </span>
                ))
              ) : (
                <div className="text-center py-8 w-full">
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>태그가 없습니다</p>
                  <Link
                    to="/new"
                    className="text-sm hover:underline"
                    style={{ color: 'var(--text-link)' }}
                  >
                    아이디어를 추가해보세요
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}