import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, Trash2, Grid3X3, List, Eye, Plus, Lightbulb } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { getStatusLabel, getStatusClass, getStatusGradient } from '../utils/labelMappings';
import type { IdeaStatus } from '../types';

export function IdeaList() {
  const { ideas, loading, deleteIdea } = useData();
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const handleDelete = async (id: string) => {
    if (confirm('이 아이디어를 삭제하시겠습니까?')) {
      try {
        await deleteIdea(id);
      } catch {
        alert('아이디어 삭제에 실패했습니다.');
      }
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    if (filter === 'all') return true;
    return idea.status === filter;
  });

  const filterButtons = [
    { key: 'all', label: '전체', count: ideas.length },
    { key: 'draft', label: '초안', count: ideas.filter(i => i.status === 'draft').length },
    { key: 'in-progress', label: '진행중', count: ideas.filter(i => i.status === 'in-progress').length },
    { key: 'completed', label: '완료', count: ideas.filter(i => i.status === 'completed').length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '400px' }}>
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p style={{ color: 'var(--text-secondary)' }}>아이디어를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
              아이디어 목록
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              창의적인 아이디어들을 관리해보세요
            </p>
          </div>

          {/* View Toggle */}
          <div
            className="flex gap-1 p-1 rounded-lg"
            style={{ backgroundColor: 'var(--bg-subtle)' }}
          >
            <button
              onClick={() => setViewMode('card')}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all"
              style={{
                backgroundColor: viewMode === 'card' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'card' ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: viewMode === 'card' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <Grid3X3 className="w-4 h-4" />
              카드형
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all"
              style={{
                backgroundColor: viewMode === 'list' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <List className="w-4 h-4" />
              목록형
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {filterButtons.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`filter-btn ${filter === key ? 'active' : ''}`}
            >
              {label}
              <span style={{ marginLeft: '0.5rem', opacity: filter === key ? 0.9 : 0.6 }}>
                ({count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {filteredIdeas.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Lightbulb className="empty-state-icon" />
            <h3 className="empty-state-title">아이디어가 없습니다</h3>
            <p className="empty-state-description">새로운 아이디어를 추가해보세요</p>
            <Link to="/new" className="btn btn-primary">
              <Plus className="w-4 h-4" />
              <span>첫 번째 아이디어 추가</span>
            </Link>
          </div>
        </div>
      ) : viewMode === 'card' ? (
        /* Card View */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredIdeas.map((idea, index) => (
            <div
              key={idea.id}
              className="idea-card group"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Accent Bar */}
              <div
                className="idea-card-accent"
                style={{ background: getStatusGradient(idea.status as IdeaStatus) }}
              />

              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <Link
                  to={`/idea/${idea.id}`}
                  className="text-base font-semibold flex-1 mr-2 line-clamp-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {idea.title}
                </Link>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/idea/${idea.id}`}
                    className="icon-btn"
                    style={{ width: '1.75rem', height: '1.75rem' }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(idea.id)}
                    className="icon-btn"
                    style={{
                      width: '1.75rem',
                      height: '1.75rem',
                      color: 'var(--color-error-500)',
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p
                className="text-sm mb-4 line-clamp-2 leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {idea.description}
              </p>

              {/* Status & Category */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`badge ${getStatusClass(idea.status as IdeaStatus)}`}>
                  {getStatusLabel(idea.status as IdeaStatus)}
                </span>
                <span className="tag">{idea.category}</span>
              </div>

              {/* Tags */}
              {idea.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {idea.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span key={tagIndex} className="tag text-xs">
                      {tag}
                    </span>
                  ))}
                  {idea.tags.length > 3 && (
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      +{idea.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div
                className="flex items-center text-xs pt-3"
                style={{
                  color: 'var(--text-tertiary)',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <Calendar className="w-3 h-3 mr-1.5" />
                {format(new Date(idea.createdAt), 'yyyy.MM.dd', { locale: ko })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="flex flex-col gap-3">
          {filteredIdeas.map((idea) => (
            <div key={idea.id} className="card card-hover group" style={{ padding: 'var(--space-4)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/idea/${idea.id}`}
                    className="text-base font-semibold mb-2 block"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {idea.title}
                  </Link>
                  <p
                    className="text-sm mb-3 line-clamp-2 leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {idea.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`badge ${getStatusClass(idea.status as IdeaStatus)}`}>
                      {getStatusLabel(idea.status as IdeaStatus)}
                    </span>
                    <span className="tag">{idea.category}</span>
                    {idea.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span key={tagIndex} className="tag text-xs">
                        {tag}
                      </span>
                    ))}
                    {idea.tags.length > 3 && (
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        +{idea.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/idea/${idea.id}`} className="icon-btn">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(idea.id)}
                      className="icon-btn"
                      style={{ color: 'var(--color-error-500)' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    <Calendar className="w-3 h-3 mr-1.5" />
                    {format(new Date(idea.createdAt), 'yyyy.MM.dd', { locale: ko })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
