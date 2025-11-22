import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, Trash2, Grid3X3, List, Eye, PlusCircle } from 'lucide-react';
import type { Idea } from '../types';
import { useData } from '../contexts/DataContext';

export function IdeaList() {
  const { ideas, loading, deleteIdea } = useData();
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const handleDelete = async (id: string) => {
    if (confirm('이 아이디어를 삭제하시겠습니까?')) {
      try {
        await deleteIdea(id);
      } catch (error) {
        console.error('Failed to delete idea:', error);
        alert('아이디어 삭제에 실패했습니다.');
      }
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    if (filter === 'all') return true;
    return idea.status === filter;
  });

  const getStatusLabel = (status: Idea['status']) => {
    switch (status) {
      case 'draft': return '초안';
      case 'in-progress': return '진행중';
      case 'completed': return '완료';
      case 'archived': return '보관됨';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-secondary">아이디어를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              아이디어 목록
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>창의적인 아이디어들을 관리해보세요</p>
          </div>

          <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
            <button
              onClick={() => setViewMode('card')}
              className="px-3 py-1.5 rounded flex items-center gap-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: viewMode === 'card' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'card' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: viewMode === 'card' ? '1px solid var(--border-default)' : '1px solid transparent'
              }}
            >
              <Grid3X3 className="h-4 w-4" />
              카드형
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="px-3 py-1.5 rounded flex items-center gap-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: viewMode === 'list' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: viewMode === 'list' ? '1px solid var(--border-default)' : '1px solid transparent'
              }}
            >
              <List className="h-4 w-4" />
              목록형
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all relative overflow-hidden"
            style={{
              background: filter === 'all' ? 'var(--gradient-purple-pink)' : 'var(--bg-hover)',
              color: filter === 'all' ? 'white' : 'var(--text-primary)',
              boxShadow: filter === 'all' ? 'var(--shadow-lg)' : 'none',
              transform: filter === 'all' ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            전체 <span className={filter === 'all' ? 'ml-1.5 opacity-90' : 'ml-1.5'}>({ideas.length})</span>
          </button>
          <button
            onClick={() => setFilter('draft')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: filter === 'draft' ? 'var(--gradient-primary)' : 'var(--bg-hover)',
              color: filter === 'draft' ? 'white' : 'var(--text-primary)',
              boxShadow: filter === 'draft' ? 'var(--shadow-lg)' : 'none',
              transform: filter === 'draft' ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            초안 <span className={filter === 'draft' ? 'ml-1.5 opacity-90' : 'ml-1.5'}>({ideas.filter(i => i.status === 'draft').length})</span>
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: filter === 'in-progress' ? 'var(--gradient-blue-cyan)' : 'var(--bg-hover)',
              color: filter === 'in-progress' ? 'white' : 'var(--text-primary)',
              boxShadow: filter === 'in-progress' ? 'var(--shadow-lg)' : 'none',
              transform: filter === 'in-progress' ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            진행중 <span className={filter === 'in-progress' ? 'ml-1.5 opacity-90' : 'ml-1.5'}>({ideas.filter(i => i.status === 'in-progress').length})</span>
          </button>
          <button
            onClick={() => setFilter('completed')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: filter === 'completed' ? 'var(--gradient-success)' : 'var(--bg-hover)',
              color: filter === 'completed' ? 'white' : 'var(--text-primary)',
              boxShadow: filter === 'completed' ? 'var(--shadow-lg)' : 'none',
              transform: filter === 'completed' ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            완료 <span className={filter === 'completed' ? 'ml-1.5 opacity-90' : 'ml-1.5'}>({ideas.filter(i => i.status === 'completed').length})</span>
          </button>
        </div>
      </div>

      {filteredIdeas.length === 0 ? (
        <div className="text-center py-16" style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>아이디어가 없습니다</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>새로운 아이디어를 추가해보세요</p>
          <Link
            to="/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--color-blue-600)' }}
          >
            <PlusCircle className="h-4 w-4" />
            첫 번째 아이디어 추가
          </Link>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredIdeas.map((idea, index) => (
            <div
              key={idea.id}
              className="p-5 rounded-xl group relative overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                transition: 'all 0.3s var(--ease-smooth)',
                animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Gradient accent on hover */}
              <div
                className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: idea.status === 'completed' ? 'var(--gradient-success)' :
                             idea.status === 'in-progress' ? 'var(--gradient-blue-cyan)' :
                             idea.status === 'archived' ? 'var(--gradient-warning)' :
                             'var(--gradient-purple-pink)'
                }}
              />
              <div className="flex items-start justify-between mb-3">
                <Link
                  to={`/idea/${idea.id}`}
                  className="text-base font-semibold flex-1 mr-2 hover:underline"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {idea.title}
                </Link>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/idea/${idea.id}`}
                    className="p-1.5 rounded hover:bg-blue-50 transition-colors"
                    title="상세보기"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(idea.id)}
                    className="p-1.5 rounded hover:bg-red-50 transition-colors"
                    title="삭제"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-sm mb-4 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {idea.description}
              </p>

              <div className="flex items-center gap-2 mb-3 flex-wrap">
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
                  {getStatusLabel(idea.status)}
                </span>
                <span className="text-xs px-2 py-0.5 rounded" style={{
                  backgroundColor: 'var(--bg-hover)',
                  color: 'var(--text-secondary)'
                }}>
                  {idea.category}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {idea.tags.slice(0, 3).map((tag, tagIndex) => (
                  <span key={tagIndex} className="text-xs px-2 py-0.5 rounded" style={{
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-secondary)'
                  }}>
                    {tag}
                  </span>
                ))}
                {idea.tags.length > 3 && (
                  <span className="text-xs px-2 py-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    +{idea.tags.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center text-xs pt-3" style={{
                color: 'var(--text-tertiary)',
                borderTop: '1px solid var(--border-default)'
              }}>
                <Calendar className="h-3 w-3 mr-1.5" />
                {format(new Date(idea.createdAt), 'MM.dd', { locale: ko })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIdeas.map((idea) => (
            <div
              key={idea.id}
              className="p-4 rounded-lg group transition-colors"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
            >
              <div className="flex items-start justify-between mb-2">
                <Link
                  to={`/idea/${idea.id}`}
                  className="text-base font-semibold hover:underline flex-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {idea.title}
                </Link>
                <div className="flex items-center gap-2 ml-4">
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
                    {getStatusLabel(idea.status)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded" style={{
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-secondary)'
                  }}>
                    {idea.category}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/idea/${idea.id}`}
                      className="p-1.5 rounded hover:bg-blue-50 transition-colors"
                      title="상세보기"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(idea.id)}
                      className="p-1.5 rounded hover:bg-red-50 transition-colors"
                      title="삭제"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-sm mb-3 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {idea.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {idea.tags.slice(0, 4).map((tag, tagIndex) => (
                    <span key={tagIndex} className="text-xs px-2 py-0.5 rounded" style={{
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-secondary)'
                    }}>
                      {tag}
                    </span>
                  ))}
                  {idea.tags.length > 4 && (
                    <span className="text-xs px-2 py-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      +{idea.tags.length - 4}
                    </span>
                  )}
                </div>
                <div className="flex items-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  <Calendar className="h-3 w-3 mr-1.5" />
                  {format(new Date(idea.createdAt), 'yyyy.MM.dd', { locale: ko })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}