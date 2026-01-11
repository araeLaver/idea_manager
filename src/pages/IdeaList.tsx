import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, Trash2, Grid3X3, List, Eye, Plus, Lightbulb, CheckSquare, Square, X, Download, Upload } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getStatusLabel, getStatusClass, getStatusGradient } from '../utils/labelMappings';
import { ExportImport } from '../components/ExportImport';
import { SkeletonList } from '../components/Skeleton';
import { ConfirmModal } from '../components/ConfirmModal';
import type { IdeaStatus } from '../types';

export function IdeaList() {
  const { ideas, loading, deleteIdea, bulkUpdateStatus } = useData();
  const { isGuest } = useAuth();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteIdea(deleteTarget);
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(deleteTarget);
        return next;
      });
      showToast('아이디어가 삭제되었습니다.', 'success');
      setDeleteTarget(null);
    } catch {
      showToast('아이디어 삭제에 실패했습니다.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredIdeas.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredIdeas.map(i => i.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBulkStatusChange = async (status: IdeaStatus) => {
    if (selectedIds.size === 0) return;

    setBulkLoading(true);
    try {
      await bulkUpdateStatus(Array.from(selectedIds), status);
      showToast(`${selectedIds.size}개 아이디어의 상태가 변경되었습니다.`, 'success');
      setSelectedIds(new Set());
    } catch {
      showToast('상태 변경에 실패했습니다.', 'error');
    } finally {
      setBulkLoading(false);
    }
  };

  const filteredIdeas = useMemo(() => ideas.filter(idea => {
    if (filter === 'all') return true;
    return idea.status === filter;
  }), [ideas, filter]);

  const filterButtons = [
    { key: 'all', label: '전체', count: ideas.length },
    { key: 'draft', label: '초안', count: ideas.filter(i => i.status === 'draft').length },
    { key: 'in-progress', label: '진행중', count: ideas.filter(i => i.status === 'in-progress').length },
    { key: 'completed', label: '완료', count: ideas.filter(i => i.status === 'completed').length },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="skeleton" style={{ width: '10rem', height: '2rem', borderRadius: 'var(--radius-lg)' }} />
          <div className="skeleton" style={{ width: '8rem', height: '2.5rem', borderRadius: 'var(--radius-lg)' }} />
        </div>
        {/* Filter Skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ width: '5rem', height: '2rem', borderRadius: 'var(--radius-full)' }} />
          ))}
        </div>
        {/* List Skeleton */}
        <SkeletonList count={5} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                아이디어 목록
              </h1>
              {isGuest && (
                <span className="badge badge-warning text-xs">게스트 모드</span>
              )}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              창의적인 아이디어들을 관리해보세요
              {isGuest && ' (브라우저에 저장됩니다)'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Export/Import Button */}
            <button
              onClick={() => setShowExportImport(true)}
              className="btn btn-secondary"
              style={{ padding: 'var(--space-2) var(--space-3)' }}
              title="내보내기 / 가져오기"
            >
              <Download className="w-4 h-4" />
              <Upload className="w-4 h-4" style={{ marginLeft: '-0.25rem' }} />
            </button>

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

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div
          className="card mb-6 flex flex-wrap items-center justify-between gap-4"
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-200)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="icon-btn"
              title={selectedIds.size === filteredIdeas.length ? '전체 해제' : '전체 선택'}
              aria-label={selectedIds.size === filteredIdeas.length ? '전체 해제' : '전체 선택'}
            >
              {selectedIds.size === filteredIdeas.length ? (
                <CheckSquare className="w-5 h-5" style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
              ) : (
                <Square className="w-5 h-5" style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
              )}
            </button>
            <span className="text-sm font-medium" style={{ color: 'var(--color-primary-700)' }}>
              {selectedIds.size}개 선택됨
            </span>
            <button
              onClick={clearSelection}
              className="icon-btn"
              title="선택 해제"
              aria-label="선택 해제"
            >
              <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              상태 변경:
            </span>
            <button
              onClick={() => handleBulkStatusChange('draft')}
              disabled={bulkLoading}
              className="badge status-draft cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              초안
            </button>
            <button
              onClick={() => handleBulkStatusChange('in-progress')}
              disabled={bulkLoading}
              className="badge status-in-progress cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              진행중
            </button>
            <button
              onClick={() => handleBulkStatusChange('completed')}
              disabled={bulkLoading}
              className="badge status-completed cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              완료
            </button>
            <button
              onClick={() => handleBulkStatusChange('archived')}
              disabled={bulkLoading}
              className="badge status-archived cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              보관됨
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {filteredIdeas.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Lightbulb className="empty-state-icon" />
            {ideas.length === 0 ? (
              <>
                <h3 className="empty-state-title">아이디어가 없습니다</h3>
                <p className="empty-state-description">새로운 아이디어를 추가해보세요</p>
                <Link to="/new" className="btn btn-primary">
                  <Plus className="w-4 h-4" />
                  <span>첫 번째 아이디어 추가</span>
                </Link>
              </>
            ) : (
              <>
                <h3 className="empty-state-title">조건에 맞는 아이디어가 없습니다</h3>
                <p className="empty-state-description">다른 필터를 선택하거나 새 아이디어를 추가해보세요</p>
                <div className="flex gap-2">
                  <button onClick={() => setFilter('all')} className="btn btn-secondary">
                    전체 보기
                  </button>
                  <Link to="/new" className="btn btn-primary">
                    <Plus className="w-4 h-4" />
                    <span>새 아이디어</span>
                  </Link>
                </div>
              </>
            )}
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
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelect(idea.id); }}
                    className="flex-shrink-0 mt-0.5"
                    aria-label={selectedIds.has(idea.id) ? `${idea.title} 선택 해제` : `${idea.title} 선택`}
                  >
                    {selectedIds.has(idea.id) ? (
                      <CheckSquare className="w-4 h-4" style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
                    ) : (
                      <Square className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} aria-hidden="true" />
                    )}
                  </button>
                  <Link
                    to={`/idea/${idea.id}`}
                    className="text-base font-semibold flex-1 mr-2 line-clamp-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {idea.title}
                  </Link>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/idea/${idea.id}`}
                    className="icon-btn"
                    style={{ width: '1.75rem', height: '1.75rem' }}
                    aria-label={`${idea.title} 상세 보기`}
                  >
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(idea.id)}
                    className="icon-btn"
                    style={{
                      width: '1.75rem',
                      height: '1.75rem',
                      color: 'var(--color-error-500)',
                    }}
                    aria-label={`${idea.title} 삭제`}
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
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
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelect(idea.id); }}
                    className="flex-shrink-0 mt-1"
                    aria-label={selectedIds.has(idea.id) ? `${idea.title} 선택 해제` : `${idea.title} 선택`}
                  >
                    {selectedIds.has(idea.id) ? (
                      <CheckSquare className="w-5 h-5" style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
                    ) : (
                      <Square className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} aria-hidden="true" />
                    )}
                  </button>
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
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/idea/${idea.id}`} className="icon-btn" aria-label={`${idea.title} 상세 보기`}>
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(idea.id)}
                      className="icon-btn"
                      style={{ color: 'var(--color-error-500)' }}
                      aria-label={`${idea.title} 삭제`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
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

      {/* Export/Import Modal */}
      {showExportImport && (
        <ExportImport onClose={() => setShowExportImport(false)} />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="아이디어 삭제"
        message="이 아이디어를 삭제하시겠습니까? 삭제된 아이디어는 복구할 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
