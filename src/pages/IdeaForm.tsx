import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, X, Calendar, Clock } from 'lucide-react';
import type { IdeaFormData, Idea } from '../types';
import { useData } from '../contexts/DataContext';
import { AIFeatures } from '../components/AIFeatures';

export function IdeaForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { createIdea, updateIdea, getIdea } = useData();

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

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');

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
      } else {
        await createIdea(formData);
      }
      navigate('/');
    } catch (error) {
      console.error('아이디어 저장 실패:', error);
      alert('아이디어 저장에 실패했습니다.');
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
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const startDateStr = start.toLocaleDateString('ko-KR');
      const endDateStr = end.toLocaleDateString('ko-KR');
      
      const timelineText = `${startDateStr} ~ ${endDateStr} (${diffDays}일간, ${startTime} - ${endTime})`;
      setFormData(prev => ({ ...prev, timeline: timelineText }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors inline-flex"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft className="h-5 w-5" />
          목록으로
        </Link>
      </div>

      <div
        className="rounded-xl p-8"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          {isEdit ? '아이디어 수정' : '새 아이디어'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              제목 *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
              placeholder="아이디어 제목을 입력하세요"
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              설명 *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-lg text-sm transition-all resize-none"
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
              placeholder="아이디어에 대한 설명을 입력하세요"
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
            />
          </div>

          {/* AI Features */}
          <AIFeatures
            title={formData.title}
            description={formData.description}
            onCategorySelect={handleCategorySelect}
            onTagsSelect={handleTagsSelect}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                카테고리 *
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-lg text-sm transition-all"
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
                placeholder="예: 웹서비스, 모바일앱"
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                상태
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Idea['status'] })}
                className="w-full px-4 py-3 rounded-lg text-sm transition-all"
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
              >
                <option value="draft">초안</option>
                <option value="in-progress">진행중</option>
                <option value="completed">완료</option>
                <option value="archived">보관됨</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              우선순위
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Idea['priority'] })}
              className="w-full px-4 py-3 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
            >
              <option value="low">낮음</option>
              <option value="medium">보통</option>
              <option value="high">높음</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              태그
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-4 py-3 rounded-lg text-sm transition-all"
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
                placeholder="태그를 입력하고 Enter를 누르세요"
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-3 rounded-lg text-white transition-all"
                style={{
                  background: 'var(--gradient-purple-pink)',
                  boxShadow: 'var(--shadow-sm)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'var(--color-blue-50)',
                    color: 'var(--color-blue-600)',
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              타겟 시장
            </label>
            <textarea
              value={formData.targetMarket}
              onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-lg text-sm transition-all resize-none"
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
              placeholder="대상 고객층과 시장 규모를 설명하세요"
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              예상 수익
            </label>
            <input
              type="text"
              value={formData.potentialRevenue}
              onChange={(e) => setFormData({ ...formData, potentialRevenue: e.target.value })}
              className="w-full px-4 py-3 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
              placeholder="예상 수익 모델과 규모"
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              필요 자원
            </label>
            <textarea
              value={formData.resources}
              onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-lg text-sm transition-all resize-none"
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
              placeholder="필요한 인력, 자금, 기술 등"
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              프로젝트 일정
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 시작일 */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <Calendar className="h-3 w-3 inline mr-1" />
                  시작일
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    updateTimeline();
                  }}
                  className="w-full px-3 py-2.5 rounded-lg text-sm transition-all"
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
                />
              </div>

              {/* 종료일 */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <Calendar className="h-3 w-3 inline mr-1" />
                  종료일 (예상)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    updateTimeline();
                  }}
                  min={startDate}
                  className="w-full px-3 py-2.5 rounded-lg text-sm transition-all"
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
                />
              </div>

              {/* 시작 시간 */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <Clock className="h-3 w-3 inline mr-1" />
                  작업 시작 시간
                </label>
                <select
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    updateTimeline();
                  }}
                  className="w-full px-3 py-2.5 rounded-lg text-sm transition-all"
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <option key={i} value={`${hour}:00`}>
                        {hour}:00
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 종료 시간 */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <Clock className="h-3 w-3 inline mr-1" />
                  작업 종료 시간
                </label>
                <select
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    updateTimeline();
                  }}
                  className="w-full px-3 py-2.5 rounded-lg text-sm transition-all"
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <option key={i} value={`${hour}:00`}>
                        {hour}:00
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* 자동 생성된 타임라인 텍스트 */}
            <div className="mt-4">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                타임라인 요약
              </label>
              <textarea
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg text-sm transition-all resize-none"
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
                placeholder="자동 생성된 타임라인 또는 직접 입력"
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              메모
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-lg text-sm transition-all resize-none"
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
              placeholder="추가 메모나 아이디어"
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link
              to="/"
              className="px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '2px solid var(--border-default)',
                color: 'var(--text-primary)',
                transform: 'translateY(0)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                e.currentTarget.style.borderColor = 'var(--color-gray-400)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px -3px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-page)';
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              취소
            </Link>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 relative overflow-hidden group"
              style={{
                background: 'var(--gradient-blue-cyan)',
                boxShadow: '0 4px 15px -3px rgba(59, 130, 246, 0.5)',
                transform: 'translateY(0)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(59, 130, 246, 0.6)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 15px -3px rgba(59, 130, 246, 0.5)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" style={{ pointerEvents: 'none' }}></div>
              <span className="relative z-10">{isEdit ? '수정하기' : '저장하기'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}