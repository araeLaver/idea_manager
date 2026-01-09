import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  ArrowLeft, Edit, Trash2, Calendar, Tag, TrendingUp,
  Target, DollarSign, Clock, Briefcase, FileText, Printer
} from 'lucide-react';
import type { Idea } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getStatusLabel, getStatusClass, getPriorityLabel, getPriorityClass } from '../utils/labelMappings';
import { ConfirmModal } from '../components/ConfirmModal';

export function IdeaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getIdea, deleteIdea } = useData();
  const { isGuest } = useAuth();
  const { showToast } = useToast();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getIdea(id).then(fetchedIdea => {
        if (fetchedIdea) {
          setIdea(fetchedIdea);
        } else {
          navigate('/');
        }
        setLoading(false);
      });
    }
  }, [id, navigate, getIdea]);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    setDeleteLoading(true);
    try {
      await deleteIdea(id);
      navigate('/');
    } catch {
      showToast('아이디어 삭제에 실패했습니다.', 'error');
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

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

  if (!idea) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          목록으로
        </Link>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn btn-secondary print-hide">
            <Printer className="w-4 h-4" />
            <span>인쇄</span>
          </button>
          <Link to={`/edit/${id}`} className="btn btn-primary print-hide">
            <Edit className="w-4 h-4" />
            <span>수정</span>
          </Link>
          <button onClick={handleDeleteClick} className="btn btn-danger print-hide">
            <Trash2 className="w-4 h-4" />
            <span>삭제</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="card" style={{ padding: 'var(--space-8)' }}>
        {/* Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-1">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {idea.title}
            </h1>
            {isGuest && (
              <span className="badge badge-warning text-xs">게스트 모드</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`badge ${getStatusClass(idea.status)}`}>
              {getStatusLabel(idea.status)}
            </span>
            <span className={`badge ${getPriorityClass(idea.priority)}`}>
              <TrendingUp className="w-3 h-3" />
              {getPriorityLabel(idea.priority)}
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            생성: {format(new Date(idea.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            수정: {format(new Date(idea.updatedAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
          </div>
        </div>

        {/* Category & Tags */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="tag" style={{ fontWeight: 600 }}>
            {idea.category}
          </span>
          {idea.tags.map((tag, index) => (
            <span key={index} className="badge badge-info">
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>

        <div className="divider" />

        {/* Description */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FileText className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            설명
          </h2>
          <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {idea.description}
          </p>
        </section>

        {/* Target Market */}
        {idea.targetMarket && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Target className="w-5 h-5" style={{ color: 'var(--color-secondary-500)' }} />
              타겟 시장
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {idea.targetMarket}
            </p>
          </section>
        )}

        {/* Potential Revenue */}
        {idea.potentialRevenue && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <DollarSign className="w-5 h-5" style={{ color: 'var(--color-success-500)' }} />
              예상 수익
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {idea.potentialRevenue}
            </p>
          </section>
        )}

        {/* Resources */}
        {idea.resources && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Briefcase className="w-5 h-5" style={{ color: 'var(--color-warning-500)' }} />
              필요 자원
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {idea.resources}
            </p>
          </section>
        )}

        {/* Timeline */}
        {idea.timeline && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Clock className="w-5 h-5" style={{ color: 'var(--color-info-500)' }} />
              타임라인
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {idea.timeline}
            </p>
          </section>
        )}

        {/* Notes */}
        {idea.notes && (
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              메모
            </h2>
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: 'var(--bg-subtle)' }}
            >
              <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {idea.notes}
              </p>
            </div>
          </section>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
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
