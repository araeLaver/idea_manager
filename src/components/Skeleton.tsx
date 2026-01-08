import type { CSSProperties } from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-md)',
  className = '',
  style = {},
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="0.875rem"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-5" aria-hidden="true">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton height="1.25rem" width="70%" className="mb-2" />
          <Skeleton height="0.75rem" width="40%" />
        </div>
        <Skeleton width="2rem" height="2rem" borderRadius="var(--radius-full)" />
      </div>
      <SkeletonText lines={2} />
      <div className="flex gap-2 mt-4">
        <Skeleton width="4rem" height="1.5rem" borderRadius="var(--radius-full)" />
        <Skeleton width="4rem" height="1.5rem" borderRadius="var(--radius-full)" />
      </div>
    </div>
  );
}

export function SkeletonIdeaCard() {
  return (
    <div className="card p-4" aria-hidden="true">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton width="3rem" height="1.25rem" borderRadius="var(--radius-full)" />
            <Skeleton width="4rem" height="1.25rem" borderRadius="var(--radius-full)" />
          </div>
          <Skeleton height="1.25rem" width="80%" className="mb-2" />
        </div>
      </div>
      <SkeletonText lines={2} />
      <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
        <div className="flex gap-2">
          <Skeleton width="3rem" height="1.25rem" borderRadius="var(--radius-full)" />
          <Skeleton width="4rem" height="1.25rem" borderRadius="var(--radius-full)" />
        </div>
        <Skeleton width="5rem" height="0.75rem" />
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6" aria-label="로딩 중">
      {/* Hero Section Skeleton */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <Skeleton width="3rem" height="3rem" borderRadius="var(--radius-xl)" />
          <div className="flex-1">
            <Skeleton height="1.5rem" width="40%" className="mb-2" />
            <Skeleton height="0.875rem" width="60%" />
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4">
            <Skeleton height="0.75rem" width="60%" className="mb-2" />
            <Skeleton height="1.5rem" width="40%" />
          </div>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <Skeleton height="1.25rem" width="30%" className="mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton width="2.5rem" height="2.5rem" borderRadius="var(--radius-full)" />
                <div className="flex-1">
                  <Skeleton height="1rem" width="70%" className="mb-1" />
                  <Skeleton height="0.75rem" width="40%" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <Skeleton height="1.25rem" width="30%" className="mb-4" />
          <Skeleton height="12rem" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-label="로딩 중">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonIdeaCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 p-4" style={{ backgroundColor: 'var(--bg-subtle)' }}>
        <Skeleton height="0.875rem" width="60%" />
        <Skeleton height="0.875rem" width="40%" />
        <Skeleton height="0.875rem" width="50%" />
        <Skeleton height="0.875rem" width="30%" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4 p-4" style={{ borderTop: '1px solid var(--border-default)' }}>
          <Skeleton height="0.875rem" width="80%" />
          <Skeleton height="0.875rem" width="60%" />
          <Skeleton height="0.875rem" width="70%" />
          <Skeleton height="0.875rem" width="50%" />
        </div>
      ))}
    </div>
  );
}
