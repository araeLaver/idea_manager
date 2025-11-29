import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Filter, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Idea } from '../types';
import { storage } from '../utils/storage';

export function SearchPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const storedIdeas = storage.getIdeas();
    setIdeas(storedIdeas);
    const uniqueCategories = Array.from(new Set(storedIdeas.map(idea => idea.category)));
    setCategories(uniqueCategories);
  }, []);

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = searchTerm === '' ||
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === '' || idea.category === selectedCategory;
    const matchesStatus = selectedStatus === '' || idea.status === selectedStatus;
    const matchesPriority = selectedPriority === '' || idea.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedPriority('');
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedStatus || selectedPriority;

  const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      'draft': 'status-draft', 'in-progress': 'status-in-progress',
      'completed': 'status-completed', 'archived': 'status-archived',
    };
    return classes[status] || 'status-draft';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = { 'draft': '초안', 'in-progress': '진행중', 'completed': '완료', 'archived': '보관됨' };
    return labels[status] || status;
  };

  const getPriorityClass = (priority: string) => {
    const classes: Record<string, string> = { 'low': 'priority-low', 'medium': 'priority-medium', 'high': 'priority-high' };
    return classes[priority] || 'priority-medium';
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = { 'low': '낮음', 'medium': '보통', 'high': '높음' };
    return labels[priority] || priority;
  };

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
        </div>
        <p className="text-sm ml-12" style={{ color: 'var(--text-secondary)' }}>
          제목, 설명, 태그로 아이디어를 검색하세요
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
            <label className="form-label">카테고리</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">전체</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">상태</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="">전체</option>
              <option value="draft">초안</option>
              <option value="in-progress">진행중</option>
              <option value="completed">완료</option>
              <option value="archived">보관됨</option>
            </select>
          </div>
          <div>
            <label className="form-label">우선순위</label>
            <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)}>
              <option value="">전체</option>
              <option value="low">낮음</option>
              <option value="medium">보통</option>
              <option value="high">높음</option>
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
