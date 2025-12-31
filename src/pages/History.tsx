import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  History as HistoryIcon, Calendar, Clock, TrendingUp,
  Search, Eye, Edit, Grid3X3, List, Tag
} from 'lucide-react';
import type { Idea } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

type SortBy = 'created' | 'updated' | 'title' | 'status' | 'priority';
type FilterBy = 'all' | 'draft' | 'in-progress' | 'completed' | 'archived';

export function History() {
  const { ideas, loading } = useData();
  const { isGuest } = useAuth();
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const filteredAndSortedIdeas = useMemo(() => {
    let result = [...ideas];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(idea =>
        idea.title.toLowerCase().includes(lowerSearch) ||
        idea.description.toLowerCase().includes(lowerSearch) ||
        idea.category.toLowerCase().includes(lowerSearch) ||
        idea.tags.some(tag => tag.toLowerCase().includes(lowerSearch))
      );
    }

    if (filterBy !== 'all') {
      result = result.filter(idea => idea.status === filterBy);
    }

    result.sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'created': compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
        case 'updated': compareValue = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(); break;
        case 'title': compareValue = a.title.localeCompare(b.title); break;
        case 'status': compareValue = a.status.localeCompare(b.status); break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          compareValue = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
      }
      return sortOrder === 'desc' ? -compareValue : compareValue;
    });

    return result;
  }, [ideas, searchTerm, filterBy, sortBy, sortOrder]);

  const getStatusClass = (status: Idea['status']) => {
    const classes: Record<string, string> = {
      'draft': 'status-draft', 'in-progress': 'status-in-progress',
      'completed': 'status-completed', 'archived': 'status-archived',
    };
    return classes[status] || 'status-draft';
  };

  const getStatusLabel = (status: Idea['status']) => {
    const labels: Record<string, string> = { 'draft': '초안', 'in-progress': '진행중', 'completed': '완료', 'archived': '보관됨' };
    return labels[status] || status;
  };

  const getPriorityClass = (priority: Idea['priority']) => {
    const classes: Record<string, string> = { 'low': 'priority-low', 'medium': 'priority-medium', 'high': 'priority-high' };
    return classes[priority] || 'priority-medium';
  };

  const getPriorityLabel = (priority: Idea['priority']) => {
    const labels: Record<string, string> = { 'low': '낮음', 'medium': '보통', 'high': '높음' };
    return labels[priority] || priority;
  };

  const handleSortChange = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '400px' }}>
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p style={{ color: 'var(--text-secondary)' }}>히스토리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="section-icon">
            <HistoryIcon className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            아이디어 히스토리
          </h1>
          {isGuest && (
            <span className="badge badge-warning text-xs">게스트 모드</span>
          )}
        </div>
        <p className="text-sm ml-12" style={{ color: 'var(--text-secondary)' }}>
          모든 아이디어의 변경 내역과 전체 기록을 확인해보세요
          {isGuest && ' (브라우저에 저장됩니다)'}
        </p>
      </div>

      {/* View Toggle & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)' }}>
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
            onClick={() => setViewMode('table')}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all"
            style={{
              backgroundColor: viewMode === 'table' ? 'var(--bg-surface)' : 'transparent',
              color: viewMode === 'table' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <List className="w-4 h-4" />
            테이블형
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="아이디어 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select value={filterBy} onChange={(e) => setFilterBy(e.target.value as FilterBy)}>
          <option value="all">모든 상태</option>
          <option value="draft">초안</option>
          <option value="in-progress">진행중</option>
          <option value="completed">완료</option>
          <option value="archived">보관됨</option>
        </select>
        <select value={sortBy} onChange={(e) => handleSortChange(e.target.value as SortBy)}>
          <option value="updated">최근 수정일</option>
          <option value="created">생성일</option>
          <option value="title">제목</option>
          <option value="status">상태</option>
          <option value="priority">우선순위</option>
        </select>
      </div>

      {/* Results Summary */}
      <div className="card mb-6" style={{ padding: 'var(--space-4)' }}>
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            총 <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>{filteredAndSortedIdeas.length}</span>개의 아이디어
          </span>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {sortBy === 'updated' ? '최근 수정일' : sortBy === 'created' ? '생성일' : sortBy === 'title' ? '제목' : sortBy === 'status' ? '상태' : '우선순위'}
            {sortOrder === 'desc' ? ' ↓' : ' ↑'}
          </span>
        </div>
      </div>

      {/* Content */}
      {filteredAndSortedIdeas.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <HistoryIcon className="empty-state-icon" />
            <h3 className="empty-state-title">검색 결과가 없습니다</h3>
            <p className="empty-state-description">다른 검색어나 필터를 시도해보세요.</p>
          </div>
        </div>
      ) : viewMode === 'card' ? (
        <div className="space-y-4">
          {filteredAndSortedIdeas.map((idea) => (
            <div key={idea.id} className="card card-hover group" style={{ padding: 'var(--space-5)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <Link to={`/idea/${idea.id}`} className="text-lg font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                    {idea.title}
                  </Link>
                  <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {idea.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <span className={`badge ${getStatusClass(idea.status)}`}>{getStatusLabel(idea.status)}</span>
                  <span className={`badge ${getPriorityClass(idea.priority)}`}>
                    <TrendingUp className="w-3 h-3" />
                    {getPriorityLabel(idea.priority)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="tag font-medium">{idea.category}</span>
                {idea.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="badge badge-info">
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
                {idea.tags.length > 3 && <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>+{idea.tags.length - 3}개 더</span>}
              </div>

              <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    생성: {format(new Date(idea.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    수정: {format(new Date(idea.updatedAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/idea/${idea.id}`} className="icon-btn"><Eye className="w-4 h-4" /></Link>
                  <Link to={`/edit/${idea.id}`} className="icon-btn"><Edit className="w-4 h-4" /></Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>아이디어</th>
                <th>카테고리</th>
                <th>상태</th>
                <th>우선순위</th>
                <th>생성일</th>
                <th>수정일</th>
                <th className="text-center">작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedIdeas.map((idea) => (
                <tr key={idea.id}>
                  <td>
                    <Link to={`/idea/${idea.id}`} className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {idea.title}
                    </Link>
                    <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{idea.description}</p>
                  </td>
                  <td><span className="tag">{idea.category}</span></td>
                  <td><span className={`badge ${getStatusClass(idea.status)}`}>{getStatusLabel(idea.status)}</span></td>
                  <td>
                    <span className={`badge ${getPriorityClass(idea.priority)}`}>
                      <TrendingUp className="w-3 h-3" />
                      {getPriorityLabel(idea.priority)}
                    </span>
                  </td>
                  <td className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {format(new Date(idea.createdAt), 'yyyy.MM.dd', { locale: ko })}
                  </td>
                  <td className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {format(new Date(idea.updatedAt), 'yyyy.MM.dd', { locale: ko })}
                  </td>
                  <td>
                    <div className="flex justify-center gap-1">
                      <Link to={`/idea/${idea.id}`} className="icon-btn"><Eye className="w-4 h-4" /></Link>
                      <Link to={`/edit/${idea.id}`} className="icon-btn"><Edit className="w-4 h-4" /></Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
