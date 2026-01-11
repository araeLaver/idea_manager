import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link, useBlocker } from 'react-router-dom';
import { ArrowLeft, Plus, X, Calendar as CalendarIcon, Clock, Bell, AlertTriangle } from 'lucide-react';
import type { IdeaFormData, IdeaStatus, IdeaPriority } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { AIFeatures } from '../components/AIFeatures';
import { STATUS_LABELS, PRIORITY_LABELS } from '../utils/labelMappings';
import { validateIdeaForm, isFormDataEqual } from '../utils/validation';

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
    timeline: '',
    deadline: '',
    reminderEnabled: false,
    reminderDays: 3
  });

  const [scheduleStartDate, setScheduleStartDate] = useState('');
  const [scheduleEndDate, setScheduleEndDate] = useState('');
  const [scheduleStartTime, setScheduleStartTime] = useState('09:00');
  const [scheduleEndTime, setScheduleEndTime] = useState('18:00');
  const [tagInput, setTagInput] = useState('');
  const [initialFormData, setInitialFormData] = useState<IdeaFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingIdea, setLoadingIdea] = useState(isEdit);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Ref to prevent multiple idea loads
  const ideaLoadedRef = useRef(false);

  // Check if form has unsaved changes (memoized for performance)
  const isDirty = useMemo(() => {
    if (!initialFormData) return false;
    return !isFormDataEqual(formData, initialFormData);
  }, [formData, initialFormData]);

  // Block navigation when form has unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !isSubmitting &&
      isDirty &&
      currentLocation.pathname !== nextLocation.pathname
  );

  // Set initial form data for new forms
  useEffect(() => {
    if (!isEdit && !initialFormData) {
      setInitialFormData({ ...formData });
    }
  }, [isEdit, initialFormData, formData]);

  // Handle browser back/refresh with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isSubmitting]);

  // Load idea data for edit mode (only once per id)
  useEffect(() => {
    if (isEdit && id && !ideaLoadedRef.current) {
      ideaLoadedRef.current = true;
      setLoadingIdea(true);
      getIdea(id)
        .then(idea => {
          if (idea) {
            const loadedData: IdeaFormData = {
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
              timeline: idea.timeline || '',
              deadline: idea.deadline || '',
              reminderEnabled: idea.reminderEnabled || false,
              reminderDays: idea.reminderDays || 3
            };
            setFormData(loadedData);
            setInitialFormData(loadedData);
          } else {
            showToast('아이디어를 찾을 수 없습니다.', 'error');
            navigate('/');
          }
          setLoadingIdea(false);
        })
        .catch((error) => {
          setLoadingIdea(false);
          showToast('아이디어를 불러오는데 실패했습니다.', 'error');
          if (import.meta.env.DEV) {
            console.error('Failed to load idea:', error);
          }
          navigate('/');
        });
    }
    // Reset ref when id changes
    return () => {
      if (id) ideaLoadedRef.current = false;
    };
  }, [id, isEdit, navigate, getIdea, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = validateIdeaForm({
      title: formData.title,
      description: formData.description,
      category: formData.category
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      showToast(validation.errors[0], 'error');
      return;
    }

    setValidationErrors([]);
    setIsSubmitting(true);
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
      setIsSubmitting(false);
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

  if (loadingIdea) {
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

        {/* Loading Skeleton */}
        <div className="card" style={{ padding: 'var(--space-8)' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="skeleton" style={{ width: '10rem', height: '1.75rem', borderRadius: 'var(--radius-md)' }} />
          </div>

          {/* Title skeleton */}
          <div className="form-group">
            <div className="skeleton" style={{ width: '3rem', height: '0.875rem', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }} />
            <div className="skeleton" style={{ width: '100%', height: '2.5rem', borderRadius: 'var(--radius-lg)' }} />
          </div>

          {/* Description skeleton */}
          <div className="form-group">
            <div className="skeleton" style={{ width: '3rem', height: '0.875rem', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }} />
            <div className="skeleton" style={{ width: '100%', height: '6rem', borderRadius: 'var(--radius-lg)' }} />
          </div>

          {/* Category & Status skeleton */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <div className="skeleton" style={{ width: '4rem', height: '0.875rem', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }} />
              <div className="skeleton" style={{ width: '100%', height: '2.5rem', borderRadius: 'var(--radius-lg)' }} />
            </div>
            <div>
              <div className="skeleton" style={{ width: '3rem', height: '0.875rem', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }} />
              <div className="skeleton" style={{ width: '100%', height: '2.5rem', borderRadius: 'var(--radius-lg)' }} />
            </div>
          </div>

          {/* Priority skeleton */}
          <div className="form-group">
            <div className="skeleton" style={{ width: '4rem', height: '0.875rem', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }} />
            <div className="skeleton" style={{ width: '100%', height: '2.5rem', borderRadius: 'var(--radius-lg)' }} />
          </div>

          {/* Tags skeleton */}
          <div className="form-group">
            <div className="skeleton" style={{ width: '3rem', height: '0.875rem', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }} />
            <div className="flex gap-2">
              <div className="skeleton flex-1" style={{ height: '2.5rem', borderRadius: 'var(--radius-lg)' }} />
              <div className="skeleton" style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-lg)' }} />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ width: '4rem', height: '1.5rem', borderRadius: 'var(--radius-full)' }} />
              ))}
            </div>
          </div>

          {/* Actions skeleton */}
          <div className="flex justify-end gap-3 pt-4">
            <div className="skeleton" style={{ width: '5rem', height: '2.5rem', borderRadius: 'var(--radius-lg)' }} />
            <div className="skeleton" style={{ width: '6rem', height: '2.5rem', borderRadius: 'var(--radius-lg)' }} />
          </div>
        </div>
      </div>
    );
  }

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
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div
              className="mb-6 p-4 rounded-lg"
              style={{
                backgroundColor: 'var(--color-error-50)',
                border: '1px solid var(--color-error-200)'
              }}
              role="alert"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-error-500)' }} />
                <span className="font-medium" style={{ color: 'var(--color-error-700)' }}>
                  입력 오류
                </span>
              </div>
              <ul className="list-disc list-inside text-sm" style={{ color: 'var(--color-error-600)' }}>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Title */}
          <div className="form-group">
            <label htmlFor="idea-title" className="form-label">제목 *</label>
            <input
              id="idea-title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (validationErrors.length > 0) setValidationErrors([]);
              }}
              placeholder="아이디어 제목을 입력하세요"
              maxLength={200}
              aria-invalid={validationErrors.some(e => e.includes('제목'))}
              aria-describedby="idea-title-hint"
            />
            <span id="idea-title-hint" className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {formData.title.length}/200
            </span>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="idea-description" className="form-label">설명 *</label>
            <textarea
              id="idea-description"
              required
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (validationErrors.length > 0) setValidationErrors([]);
              }}
              rows={4}
              placeholder="아이디어에 대한 설명을 입력하세요"
              maxLength={5000}
              aria-invalid={validationErrors.some(e => e.includes('설명'))}
              aria-describedby="idea-description-hint"
            />
            <span id="idea-description-hint" className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {formData.description.length}/5000
            </span>
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
              <label htmlFor="idea-category" className="form-label">카테고리 *</label>
              <input
                id="idea-category"
                type="text"
                required
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  if (validationErrors.length > 0) setValidationErrors([]);
                }}
                placeholder="예: 웹서비스, 모바일앱"
                maxLength={50}
                aria-invalid={validationErrors.some(e => e.includes('카테고리'))}
              />
            </div>
            <div>
              <label htmlFor="idea-status" className="form-label">상태</label>
              <select
                id="idea-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as IdeaStatus })}
              >
                {(Object.entries(STATUS_LABELS) as [IdeaStatus, string][]).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority */}
          <div className="form-group">
            <label htmlFor="idea-priority" className="form-label">우선순위</label>
            <select
              id="idea-priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as IdeaPriority })}
            >
              {(Object.entries(PRIORITY_LABELS) as [IdeaPriority, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Deadline & Reminder */}
          <div className="form-group">
            <label className="form-label flex items-center gap-2">
              <Bell className="w-4 h-4" />
              마감일 및 알림
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1.5 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <CalendarIcon className="w-3 h-3" />
                  마감일
                </label>
                <input
                  type="date"
                  value={formData.deadline || ''}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                  알림 설정
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reminderEnabled || false}
                      onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: 'var(--color-primary-600)' }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>알림 받기</span>
                  </label>
                </div>
              </div>
            </div>
            {formData.reminderEnabled && (
              <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                  마감일 며칠 전에 알림을 받으시겠습니까?
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={formData.reminderDays || 3}
                    onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) })}
                    style={{ maxWidth: '120px' }}
                  >
                    <option value={1}>1일 전</option>
                    <option value={2}>2일 전</option>
                    <option value={3}>3일 전</option>
                    <option value={5}>5일 전</option>
                    <option value={7}>7일 전</option>
                    <option value={14}>14일 전</option>
                  </select>
                  <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    {formData.deadline ? (
                      (() => {
                        const deadlineDate = new Date(formData.deadline);
                        const reminderDate = new Date(deadlineDate);
                        reminderDate.setDate(reminderDate.getDate() - (formData.reminderDays || 3));
                        return `(${reminderDate.toLocaleDateString('ko-KR')}에 알림)`;
                      })()
                    ) : '(마감일을 설정해주세요)'}
                  </span>
                </div>
              </div>
            )}
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

      {/* Unsaved Changes Confirmation Modal */}
      {blocker.state === 'blocked' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card" style={{ padding: 'var(--space-6)', maxWidth: '400px', width: '100%' }}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="p-2 rounded-full"
                style={{ backgroundColor: 'var(--color-warning-100)' }}
              >
                <AlertTriangle className="w-5 h-5" style={{ color: 'var(--color-warning-600)' }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                저장하지 않은 변경사항
              </h3>
            </div>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              작성 중인 내용이 있습니다. 저장하지 않고 나가시겠습니까?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => blocker.reset?.()}
                className="btn btn-secondary"
              >
                계속 작성
              </button>
              <button
                type="button"
                onClick={() => blocker.proceed?.()}
                className="btn btn-danger"
              >
                저장 안 함
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
