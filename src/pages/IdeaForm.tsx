import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import type { IdeaFormData, Idea } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { AIFeatures } from '../components/AIFeatures';

export function IdeaForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { createIdea, updateIdea, getIdea } = useData();
  const { isGuest } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<IdeaFormData>({
    title: '',
    description: '',
    category: '',
    tags: [],
    status: 'draft',
    priority: 'medium',
    notes: '',
    targetMarket: '',
    potentialRevenue: '',
    resources: '',
    timeline: ''
  });

  const [scheduleStartDate, setScheduleStartDate] = useState('');
  const [scheduleEndDate, setScheduleEndDate] = useState('');
  const [scheduleStartTime, setScheduleStartTime] = useState('09:00');
  const [scheduleEndTime, setScheduleEndTime] = useState('18:00');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      getIdea(id).then(idea => {
        if (idea) {
          setFormData({
            title: idea.title,
            description: idea.description,
            category: idea.category,
            tags: idea.tags,
            status: idea.status,
            priority: idea.priority,
            notes: idea.notes || '',
            targetMarket: idea.targetMarket || '',
            potentialRevenue: idea.potentialRevenue || '',
            resources: idea.resources || '',
            timeline: idea.timeline || ''
          });
        } else {
          navigate('/');
        }
      });
    }
  }, [id, isEdit, navigate, getIdea]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && id) {
        await updateIdea(id, formData);
        showToast('아이디어가 수정되었습니다.', 'success');
      } else {
        await createIdea(formData);
        showToast('새 아이디어가 저장되었습니다.', 'success');
      }
      navigate('/');
    } catch {
      showToast('아이디어 저장에 실패했습니다.', 'error');
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleCategorySelect = (category: string) => {
    setFormData({ ...formData, category });
  };

  const handleTagsSelect = (tags: string[]) => {
    const newTags = [...formData.tags];
    tags.forEach(tag => {
      if (!newTags.includes(tag)) {
        newTags.push(tag);
      }
    });
    setFormData({ ...formData, tags: newTags });
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const updateTimeline = () => {
    if (scheduleStartDate && scheduleEndDate) {
      const start = new Date(scheduleStartDate);
      const end = new Date(scheduleEndDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const startDateStr = start.toLocaleDateString('ko-KR');
      const endDateStr = end.toLocaleDateString('ko-KR');
      const timelineText = `${startDateStr} ~ ${endDateStr} (${diffDays}일간, ${scheduleStartTime} - ${scheduleEndTime})`;
      setFormData(prev => ({ ...prev, timeline: timelineText }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          목록으로
        </Link>
      </div>

      {/* Form Card */}
      <div className="card" style={{ padding: 'var(--space-8)' }}>
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {isEdit ? '아이디어 수정' : '새 아이디어'}
          </h1>
          {isGuest && (
            <span className="badge badge-warning text-xs">게스트 모드</span>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">제목 *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="아이디어 제목을 입력하세요"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">설명 *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="아이디어에 대한 설명을 입력하세요"
            />
          </div>

          {/* AI Features */}
          <AIFeatures
            title={formData.title}
            description={formData.description}
            tags={formData.tags}
            onCategorySelect={handleCategorySelect}
            onTagsSelect={handleTagsSelect}
            onTitleChange={(title) => setFormData({ ...formData, title })}
            onDescriptionChange={(description) => setFormData({ ...formData, description })}
          />

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="form-label">카테고리 *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="예: 웹서비스, 모바일앱"
              />
            </div>
            <div>
              <label className="form-label">상태</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Idea['status'] })}
              >
                <option value="draft">초안</option>
                <option value="in-progress">진행중</option>
                <option value="completed">완료</option>
                <option value="archived">보관됨</option>
              </select>
            </div>
          </div>

          {/* Priority */}
          <div className="form-group">
            <label className="form-label">우선순위</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Idea['priority'] })}
            >
              <option value="low">낮음</option>
              <option value="medium">보통</option>
              <option value="high">높음</option>
            </select>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">태그</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="태그를 입력하고 Enter를 누르세요"
                className="flex-1"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn btn-primary"
                style={{ padding: 'var(--space-3)' }}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span key={index} className="badge badge-info flex items-center gap-1.5">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="opacity-70 hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Target Market */}
          <div className="form-group">
            <label className="form-label">타겟 시장</label>
            <textarea
              value={formData.targetMarket}
              onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
              rows={3}
              placeholder="대상 고객층과 시장 규모를 설명하세요"
            />
          </div>

          {/* Potential Revenue */}
          <div className="form-group">
            <label className="form-label">예상 수익</label>
            <input
              type="text"
              value={formData.potentialRevenue}
              onChange={(e) => setFormData({ ...formData, potentialRevenue: e.target.value })}
              placeholder="예상 수익 모델과 규모"
            />
          </div>

          {/* Resources */}
          <div className="form-group">
            <label className="form-label">필요 자원</label>
            <textarea
              value={formData.resources}
              onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
              rows={3}
              placeholder="필요한 인력, 자금, 기술 등"
            />
          </div>

          {/* Timeline */}
          <div className="form-group">
            <label className="form-label">프로젝트 일정</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1.5 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <CalendarIcon className="w-3 h-3" />
                  시작일
                </label>
                <input
                  type="date"
                  value={scheduleStartDate}
                  onChange={(e) => { setScheduleStartDate(e.target.value); updateTimeline(); }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <CalendarIcon className="w-3 h-3" />
                  종료일 (예상)
                </label>
                <input
                  type="date"
                  value={scheduleEndDate}
                  onChange={(e) => { setScheduleEndDate(e.target.value); updateTimeline(); }}
                  min={scheduleStartDate}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <Clock className="w-3 h-3" />
                  작업 시작 시간
                </label>
                <select
                  value={scheduleStartTime}
                  onChange={(e) => { setScheduleStartTime(e.target.value); updateTimeline(); }}
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return <option key={i} value={`${hour}:00`}>{hour}:00</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <Clock className="w-3 h-3" />
                  작업 종료 시간
                </label>
                <select
                  value={scheduleEndTime}
                  onChange={(e) => { setScheduleEndTime(e.target.value); updateTimeline(); }}
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return <option key={i} value={`${hour}:00`}>{hour}:00</option>;
                  })}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                타임라인 요약
              </label>
              <textarea
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                rows={2}
                placeholder="자동 생성된 타임라인 또는 직접 입력"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">메모</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              placeholder="추가 메모나 아이디어"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Link to="/" className="btn btn-secondary">
              취소
            </Link>
            <button type="submit" className="btn btn-primary">
              {isEdit ? '수정하기' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
