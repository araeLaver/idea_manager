import { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { BarChart3, TrendingUp, Calendar, Target, Lightbulb } from 'lucide-react';

// 색상 팔레트
const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  neutral: '#6b7280',
};

const STATUS_COLORS: Record<string, string> = {
  draft: COLORS.neutral,
  'in-progress': COLORS.info,
  completed: COLORS.success,
  archived: COLORS.warning,
};

const PRIORITY_COLORS: Record<string, string> = {
  low: COLORS.success,
  medium: COLORS.warning,
  high: COLORS.danger,
};

// 상태/우선순위 라벨
const STATUS_LABELS: Record<string, string> = {
  draft: '초안',
  'in-progress': '진행 중',
  completed: '완료',
  archived: '보관',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: '낮음',
  medium: '보통',
  high: '높음',
};

// 도넛 차트 컴포넌트
function DonutChart({
  data,
  colors,
  labels,
  title,
  size = 180,
}: {
  data: { key: string; value: number }[];
  colors: Record<string, string>;
  labels: Record<string, string>;
  title: string;
  size?: number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ height: size }}>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>데이터 없음</p>
      </div>
    );
  }

  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;
  const segments = data.filter(d => d.value > 0).map((d) => {
    const percent = d.value / total;
    const dashArray = `${circumference * percent} ${circumference * (1 - percent)}`;
    const dashOffset = -currentOffset;
    currentOffset += circumference * percent;
    return { ...d, dashArray, dashOffset, percent };
  });

  return (
    <div className="flex flex-col items-center">
      <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </h4>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {segments.map((seg) => (
            <circle
              key={seg.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colors[seg.key] || COLORS.neutral}
              strokeWidth={strokeWidth}
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          ))}
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ color: 'var(--text-primary)' }}
        >
          <span className="text-2xl font-bold">{total}</span>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>전체</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[seg.key] }}
            />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {labels[seg.key]} ({seg.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 막대 차트 컴포넌트
function BarChart({
  data,
  title,
  color = COLORS.primary,
}: {
  data: { label: string; value: number }[];
  title: string;
  color?: string;
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div>
      <h4 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </h4>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span
              className="text-xs w-20 truncate"
              style={{ color: 'var(--text-tertiary)' }}
              title={item.label}
            >
              {item.label}
            </span>
            <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: color,
                  minWidth: item.value > 0 ? '8px' : '0',
                }}
              />
            </div>
            <span className="text-sm font-medium w-8 text-right" style={{ color: 'var(--text-primary)' }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 트렌드 차트 (최근 7일/주)
function TrendChart({
  data,
  title,
}: {
  data: { label: string; value: number }[];
  title: string;
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const height = 120;

  return (
    <div>
      <h4 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </h4>
      <div className="flex items-end justify-between gap-1" style={{ height }}>
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t transition-all duration-500"
              style={{
                height: `${(item.value / maxValue) * (height - 24)}px`,
                minHeight: item.value > 0 ? '4px' : '0',
                background: `linear-gradient(to top, ${COLORS.primary}, ${COLORS.secondary})`,
              }}
            />
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 통계 카드 컴포넌트
function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  subValue?: string;
  color: string;
}) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>
            {label}
          </p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
          {subValue && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              {subValue}
            </p>
          )}
        </div>
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

export function Statistics() {
  const { ideas, loading } = useData();

  // 통계 계산
  const stats = useMemo(() => {
    const now = new Date();

    // 상태별 분포
    const statusCounts = ideas.reduce((acc, idea) => {
      acc[idea.status] = (acc[idea.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 우선순위별 분포
    const priorityCounts = ideas.reduce((acc, idea) => {
      acc[idea.priority] = (acc[idea.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 카테고리별 분포 (상위 5개)
    const categoryCounts = ideas.reduce((acc, idea) => {
      if (idea.category) {
        acc[idea.category] = (acc[idea.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({ label, value }));

    // 최근 7일간 생성 트렌드
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const dailyTrend = last7Days.map((date) => {
      const dateStr = date.toISOString().split('T')[0];
      const count = ideas.filter((idea) => idea.createdAt.startsWith(dateStr)).length;
      return {
        label: ['일', '월', '화', '수', '목', '금', '토'][date.getDay()],
        value: count,
      };
    });

    // 월별 트렌드 (최근 6개월)
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - (5 - i));
      return date;
    });

    const monthlyTrend = last6Months.map((date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const count = ideas.filter((idea) => {
        const ideaDate = new Date(idea.createdAt);
        return ideaDate.getFullYear() === year && ideaDate.getMonth() === month;
      }).length;
      return {
        label: `${month + 1}월`,
        value: count,
      };
    });

    // 완료율
    const completionRate = ideas.length > 0
      ? Math.round((statusCounts['completed'] || 0) / ideas.length * 100)
      : 0;

    // 이번 주 생성
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const thisWeekCount = ideas.filter((idea) => new Date(idea.createdAt) >= weekStart).length;

    // 이번 달 생성
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthCount = ideas.filter((idea) => new Date(idea.createdAt) >= monthStart).length;

    return {
      total: ideas.length,
      statusCounts,
      priorityCounts,
      topCategories,
      dailyTrend,
      monthlyTrend,
      completionRate,
      thisWeekCount,
      thisMonthCount,
      highPriorityCount: priorityCounts['high'] || 0,
      inProgressCount: statusCounts['in-progress'] || 0,
    };
  }, [ideas]);

  if (loading) {
    return (
      <div className="space-y-6 py-6">
        {/* 헤더 스켈레톤 */}
        <div className="flex items-center gap-3">
          <div className="skeleton" style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-lg)' }} />
          <div>
            <div className="skeleton" style={{ width: '6rem', height: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }} />
            <div className="skeleton" style={{ width: '12rem', height: '0.875rem', borderRadius: 'var(--radius-md)' }} />
          </div>
        </div>

        {/* 요약 카드 스켈레톤 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="skeleton" style={{ width: '4rem', height: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }} />
                  <div className="skeleton" style={{ width: '3rem', height: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '0.25rem' }} />
                  <div className="skeleton" style={{ width: '5rem', height: '0.625rem', borderRadius: 'var(--radius-md)' }} />
                </div>
                <div className="skeleton" style={{ width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-lg)' }} />
              </div>
            </div>
          ))}
        </div>

        {/* 차트 스켈레톤 */}
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
              <div className="skeleton" style={{ width: '6rem', height: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', marginLeft: 'auto', marginRight: 'auto' }} />
              <div className="skeleton" style={{ width: '180px', height: '180px', borderRadius: 'var(--radius-full)', marginLeft: 'auto', marginRight: 'auto' }} />
            </div>
          ))}
        </div>

        {/* 트렌드 스켈레톤 */}
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
              <div className="skeleton" style={{ width: '8rem', height: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }} />
              <div className="flex items-end justify-between gap-1" style={{ height: '120px' }}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <div key={j} className="skeleton flex-1" style={{ height: `${40 + Math.random() * 60}%`, borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-lg"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            통계
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            아이디어 현황과 트렌드를 한눈에 확인하세요
          </p>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Lightbulb}
          label="전체 아이디어"
          value={stats.total}
          subValue={`이번 달 ${stats.thisMonthCount}개`}
          color={COLORS.primary}
        />
        <StatCard
          icon={Target}
          label="완료율"
          value={`${stats.completionRate}%`}
          subValue={`${stats.statusCounts['completed'] || 0}개 완료`}
          color={COLORS.success}
        />
        <StatCard
          icon={TrendingUp}
          label="진행 중"
          value={stats.inProgressCount}
          subValue="현재 작업 중인 아이디어"
          color={COLORS.info}
        />
        <StatCard
          icon={Calendar}
          label="이번 주"
          value={stats.thisWeekCount}
          subValue="새로 생성된 아이디어"
          color={COLORS.secondary}
        />
      </div>

      {/* 차트 섹션 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 상태 분포 */}
        <div
          className="p-6 rounded-xl"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <DonutChart
            data={['draft', 'in-progress', 'completed', 'archived'].map((key) => ({
              key,
              value: stats.statusCounts[key] || 0,
            }))}
            colors={STATUS_COLORS}
            labels={STATUS_LABELS}
            title="상태별 분포"
          />
        </div>

        {/* 우선순위 분포 */}
        <div
          className="p-6 rounded-xl"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <DonutChart
            data={['low', 'medium', 'high'].map((key) => ({
              key,
              value: stats.priorityCounts[key] || 0,
            }))}
            colors={PRIORITY_COLORS}
            labels={PRIORITY_LABELS}
            title="우선순위별 분포"
          />
        </div>
      </div>

      {/* 트렌드 & 카테고리 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 일별 트렌드 */}
        <div
          className="p-6 rounded-xl"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <TrendChart data={stats.dailyTrend} title="최근 7일 생성 트렌드" />
        </div>

        {/* 월별 트렌드 */}
        <div
          className="p-6 rounded-xl"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <TrendChart data={stats.monthlyTrend} title="최근 6개월 트렌드" />
        </div>
      </div>

      {/* 카테고리별 분포 */}
      <div
        className="p-6 rounded-xl"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
      >
        {stats.topCategories.length > 0 ? (
          <BarChart
            data={stats.topCategories}
            title="상위 카테고리"
            color={COLORS.primary}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              카테고리 데이터가 없습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
