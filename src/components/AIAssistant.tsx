import { useState, useEffect, useRef } from 'react';
import { Bot, Lightbulb, Wand2, Sparkles, Loader2, ChevronRight } from 'lucide-react';
import { aiService } from '../services/aiService';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import { getPriorityLabel, getPriorityColor, CATEGORIES } from '../utils/labelMappings';
import type { IdeaPriority } from '../types';

interface AISuggestion {
  title: string;
  description: string;
  category: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { createIdea } = useData();
  const { showToast } = useToast();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Escape key and focus management
  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const results = await aiService.generateIdeaSuggestions(keyword, selectedCategory);
      setSuggestions(results);
    } catch (error) {
      // Show error message to user
      const errorMessage = error instanceof Error ? error.message : '아이디어 생성 중 오류가 발생했습니다.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIdea = async (suggestion: AISuggestion) => {
    try {
      await createIdea({
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category,
        priority: suggestion.priority,
        status: 'draft',
        tags: suggestion.tags,
      });
      showToast('아이디어가 성공적으로 생성되었습니다!', 'success');
    } catch {
      showToast('아이디어 생성에 실패했습니다.', 'error');
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-ghost p-2 rounded-xl hover:bg-hover transition-all group fixed bottom-6 right-6 z-40 shadow-xl bg-accent text-white"
        title="AI 어시스턴트"
        aria-label="AI 어시스턴트 열기"
      >
        <Bot className="h-6 w-6 transition-transform group-hover:scale-110" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-assistant-title"
          onClick={handleBackdropClick}
        >
          <div className="bg-tertiary rounded-2xl shadow-2xl max-w-4xl w-full max-h-90vh overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-accent" aria-hidden="true">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 id="ai-assistant-title" className="text-xl font-bold text-primary">AI 어시스턴트</h2>
                    <p className="text-sm text-secondary">창의적인 아이디어를 발견해보세요</p>
                  </div>
                </div>
                <button
                  ref={closeButtonRef}
                  onClick={() => setIsOpen(false)}
                  className="btn-ghost p-2 rounded-xl hover:bg-hover transition-all"
                  aria-label="닫기"
                >
                  ✕
                </button>
              </div>

              {/* 검색 옵션 */}
              <div className="mb-6 p-4 bg-secondary rounded-xl">
                <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  아이디어 생성 옵션
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      키워드 (선택사항)
                    </label>
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="예: 모바일, AI, 환경..."
                      className="w-full px-3 py-2 border border-primary rounded-lg text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      카테고리 (선택사항)
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-primary rounded-lg text-sm"
                    >
                      <option value="">모든 카테고리</option>
                      {CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={generateSuggestions}
                  disabled={loading}
                  className="btn btn-primary w-full shadow-glow hover:shadow-xl transition-all group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      AI가 아이디어를 생성하는 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 transition-transform group-hover:rotate-12" />
                      아이디어 생성하기
                    </>
                  )}
                </button>
              </div>

              {/* AI 제안 결과 */}
              {suggestions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-accent" />
                    AI 추천 아이디어 ({suggestions.length}개)
                  </h3>
                  
                  <div className="grid gap-4">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="card group animate-slide-in-up" style={{animationDelay: `${index * 100}ms`}}>
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-base font-semibold text-primary group-hover:text-accent transition-colors flex-1">
                              {suggestion.title}
                            </h4>
                            <div className="flex items-center gap-2 ml-3">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(suggestion.priority as IdeaPriority)}`}>
                                {getPriorityLabel(suggestion.priority as IdeaPriority)}
                              </span>
                              <span className="text-xs bg-secondary text-secondary px-2 py-1 rounded-full font-medium">
                                {suggestion.category}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-secondary text-sm mb-3 leading-relaxed">
                            {suggestion.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-1 mb-4">
                            {suggestion.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="inline-flex items-center px-2 py-1 rounded text-xs bg-accent text-accent font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleCreateIdea(suggestion)}
                              className="btn btn-primary text-sm shadow-sm hover:shadow-lg transition-all group/create"
                            >
                              <ChevronRight className="h-4 w-4 mr-1 transition-transform group-hover/create:translate-x-1" />
                              아이디어로 추가
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 첫 화면 가이드 */}
              {suggestions.length === 0 && !loading && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">AI 아이디어 생성기</h3>
                  <p className="text-secondary text-sm max-w-md mx-auto">
                    키워드나 카테고리를 선택하여 AI가 제안하는 창의적인 아이디어들을 확인해보세요.
                    생성된 아이디어는 바로 프로젝트에 추가할 수 있습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}