import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Filter, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { getStatusLabel, getStatusClass, getPriorityLabel, getPriorityClass, STATUS_LABELS, PRIORITY_LABELS } from '../utils/labelMappings';
import type { IdeaStatus, IdeaPriority } from '../types';

export function SearchPage() {
  const { ideas, loading } = useData();
  const { isGuest } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const categories = useMemo(() => {
    return Array.from(new Set(ideas.map(idea => idea.category)));
  }, [ideas]);

  const filteredIdeas = useMemo(() => {
    return ideas.filter(idea => {
      const matchesSearch = debouncedSearchTerm === '' ||
        idea.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        idea.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        idea.tags.some(tag => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === '' || idea.category === selectedCategory;
      const matchesStatus = selectedStatus === '' || idea.status === selectedStatus;
      const matchesPriority = selectedPriority === '' || idea.priority === selectedPriority;
      return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
    });
  }, [ideas, debouncedSearchTerm, selectedCategory, selectedStatus, selectedPriority]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedPriority('');
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedStatus || selectedPriority;

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
        <div className="flex items-center gap-3 mb-2">
          <div className="section-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}>
            <Search className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            아이디어 검색
          </h1>
          {isGuest && (
            <span className="badge badge-warning text-xs">게스트 모드</span>
          )}
        </div>
        <p className="text-sm ml-12" style={{ color: 'var(--text-secondary)' }}>
          제목, 설명, 태그로 아이디어를 검색하세요
          {isGuest && ' (브라우저에 저장됩니다)'}
        </p>
      </div>

      {/* Search & Filters */}
      <div className="card mb-6" style={{ padding: 'var(--space-6)' }}>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="제목, 설명, 태그로 검색..."
              className="search-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search-category" className="form-label">카테고리</label>
            <select id="search-category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">전체</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="search-status" className="form-label">상태</label>
            <select id="search-status" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="">전체</option>
              {(Object.entries(STATUS_LABELS) as [IdeaStatus, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="search-priority" className="form-label">우선순위</label>
            <select id="search-priority" value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)}>
              <option value="">전체</option>
              {(Object.entries(PRIORITY_LABELS) as [IdeaPriority, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px solid var(--border-default)' }}>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>{filteredIdeas.length}</span>개의 결과
            </span>
            <button onClick={clearFilters} className="btn btn-ghost btn-sm">
              <X className="w-4 h-4" />
              필터 초기화
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {filteredIdeas.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Filter className="empty-state-icon" />
            <h3 className="empty-state-title">검색 결과가 없습니다</h3>
            <p className="empty-state-description">다른 검색어나 필터를 시도해보세요.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIdeas.map((idea) => (
            <Link
              key={idea.id}
              to={`/idea/${idea.id}`}
              className="card card-hover block"
              style={{ padding: 'var(--space-5)' }}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{idea.title}</h3>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <span className={`badge ${getPriorityClass(idea.priority)}`}>
                    <TrendingUp className="w-3 h-3" />
                    {getPriorityLabel(idea.priority)}
                  </span>
                  <span className={`badge ${getStatusClass(idea.status)}`}>
                    {getStatusLabel(idea.status)}
                  </span>
                </div>
              </div>
              <p className="text-sm mb-4 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {idea.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  <span className="tag">{idea.category}</span>
                  <span>{format(new Date(idea.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}</span>
                </div>
                <div className="flex gap-1">
                  {idea.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="tag text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
