import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  ArrowLeft, Edit, Trash2, Calendar, Tag, TrendingUp, 
  Target, DollarSign, Clock, Briefcase
} from 'lucide-react';
import type { Idea } from '../types';
import { storage } from '../utils/storage';

export function IdeaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<Idea | null>(null);

  useEffect(() => {
    if (id) {
      const storedIdea = storage.getIdea(id);
      if (storedIdea) {
        setIdea(storedIdea);
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  const handleDelete = () => {
    if (id && confirm('이 아이디어를 삭제하시겠습니까?')) {
      storage.deleteIdea(id);
      navigate('/');
    }
  };

  if (!idea) return null;

  const getStatusStyle = (status: Idea['status']) => {
    switch (status) {
      case 'draft':
        return {
          backgroundColor: 'var(--color-gray-100)',
          color: 'var(--color-gray-600)'
        };
      case 'in-progress':
        return {
          backgroundColor: 'var(--color-blue-50)',
          color: 'var(--color-blue-600)'
        };
      case 'completed':
        return {
          backgroundColor: 'var(--color-green-50)',
          color: 'var(--color-green-600)'
        };
      case 'archived':
        return {
          backgroundColor: 'var(--color-yellow-50)',
          color: 'var(--color-yellow-500)'
        };
    }
  };

  const getPriorityStyle = (priority: Idea['priority']) => {
    switch (priority) {
      case 'low': return { color: 'var(--color-gray-500)' };
      case 'medium': return { color: 'var(--color-yellow-500)' };
      case 'high': return { color: 'var(--color-red-500)' };
    }
  };

  const getStatusLabel = (status: Idea['status']) => {
    switch (status) {
      case 'draft': return '초안';
      case 'in-progress': return '진행중';
      case 'completed': return '완료';
      case 'archived': return '보관됨';
    }
  };

  const getPriorityLabel = (priority: Idea['priority']) => {
    switch (priority) {
      case 'low': return '낮음';
      case 'medium': return '보통';
      case 'high': return '높음';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with actions */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft className="h-5 w-5" />
          목록으로
        </Link>
        <div className="flex gap-3">
          <Link
            to={`/edit/${id}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300"
            style={{
              background: 'var(--gradient-blue-cyan)',
              boxShadow: '0 4px 15px -3px rgba(59, 130, 246, 0.4)',
              transform: 'translateY(0)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(59, 130, 246, 0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 15px -3px rgba(59, 130, 246, 0.4)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Edit className="h-4 w-4" />
            수정
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
            style={{
              backgroundColor: 'var(--color-red-500)',
              color: 'white',
              boxShadow: '0 4px 15px -3px rgba(239, 68, 68, 0.4)',
              transform: 'translateY(0)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-red-600)';
              e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(239, 68, 68, 0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-red-500)';
              e.currentTarget.style.boxShadow = '0 4px 15px -3px rgba(239, 68, 68, 0.4)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Trash2 className="h-4 w-4" />
            삭제
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div
        className="rounded-xl p-8"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold flex-1 mr-4" style={{ color: 'var(--text-primary)' }}>
              {idea.title}
            </h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold"
                style={getStatusStyle(idea.status)}
              >
                {getStatusLabel(idea.status)}
              </span>
              <div className="flex items-center gap-1" style={getPriorityStyle(idea.priority)}>
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium">{getPriorityLabel(idea.priority)}</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm mb-5" style={{ color: 'var(--text-tertiary)' }}>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              생성: {format(new Date(idea.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              수정: {format(new Date(idea.updatedAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
            </div>
          </div>

          {/* Category */}
          <div className="mb-4">
            <span className="text-sm font-medium mr-2" style={{ color: 'var(--text-secondary)' }}>카테고리:</span>
            <span
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-primary)',
              }}
            >
              {idea.category}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {idea.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                style={{
                  backgroundColor: 'var(--color-blue-50)',
                  color: 'var(--color-blue-600)',
                }}
              >
                <Tag className="h-3.5 w-3.5" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="pt-6" style={{ borderTop: '1px solid var(--border-default)' }}>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            설명
          </h2>
          <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {idea.description}
          </p>
        </div>

        {/* Target Market */}
        {idea.targetMarket && (
          <div className="pt-6 mt-6" style={{ borderTop: '1px solid var(--border-default)' }}>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Target className="h-5 w-5" />
              타겟 시장
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {idea.targetMarket}
            </p>
          </div>
        )}

        {/* Potential Revenue */}
        {idea.potentialRevenue && (
          <div className="pt-6 mt-6" style={{ borderTop: '1px solid var(--border-default)' }}>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <DollarSign className="h-5 w-5" />
              예상 수익
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {idea.potentialRevenue}
            </p>
          </div>
        )}

        {/* Resources */}
        {idea.resources && (
          <div className="pt-6 mt-6" style={{ borderTop: '1px solid var(--border-default)' }}>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Briefcase className="h-5 w-5" />
              필요 자원
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {idea.resources}
            </p>
          </div>
        )}

        {/* Timeline */}
        {idea.timeline && (
          <div className="pt-6 mt-6" style={{ borderTop: '1px solid var(--border-default)' }}>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Clock className="h-5 w-5" />
              타임라인
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {idea.timeline}
            </p>
          </div>
        )}

        {/* Notes */}
        {idea.notes && (
          <div className="pt-6 mt-6" style={{ borderTop: '1px solid var(--border-default)' }}>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              메모
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {idea.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}