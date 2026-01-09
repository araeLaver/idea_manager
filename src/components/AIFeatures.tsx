import { useState } from 'react';
import { Bot, Tag, FolderOpen, Wand2, Loader2, Search, Target, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, Lightbulb, Check } from 'lucide-react';
import { aiService } from '../services/aiService';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';

interface AIFeaturesProps {
  title: string;
  description: string;
  tags?: string[];
  onCategorySelect?: (category: string) => void;
  onTagsSelect?: (tags: string[]) => void;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
}

interface SimilarIdea {
  id: string;
  title: string;
  similarity: number;
  matchedKeywords: string[];
}

interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface ImprovementSuggestions {
  improvedTitle?: string;
  improvedDescription?: string;
  suggestions: string[];
}

export function AIFeatures({ title, description, tags, onCategorySelect, onTagsSelect, onTitleChange, onDescriptionChange }: AIFeaturesProps) {
  const { ideas } = useData();
  const { showToast } = useToast();
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [loadingSWOT, setLoadingSWOT] = useState(false);
  const [loadingImprove, setLoadingImprove] = useState(false);
  const [categoryPrediction, setCategoryPrediction] = useState<{ category: string; confidence: number } | null>(null);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [similarIdeas, setSimilarIdeas] = useState<SimilarIdea[]>([]);
  const [swotAnalysis, setSWOTAnalysis] = useState<SWOTAnalysis | null>(null);
  const [improvements, setImprovements] = useState<ImprovementSuggestions | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const suggestCategory = async () => {
    if (!title && !description) {
      showToast('제목이나 설명을 먼저 입력해주세요.', 'warning');
      return;
    }

    setLoadingCategory(true);
    try {
      const prediction = await aiService.categorizeIdea(title, description);
      setCategoryPrediction(prediction);
    } catch {
      showToast('카테고리 예측에 실패했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setLoadingCategory(false);
    }
  };

  const suggestTags = async () => {
    if (!title && !description) {
      showToast('제목이나 설명을 먼저 입력해주세요.', 'warning');
      return;
    }

    setLoadingTags(true);
    try {
      const suggestions = await aiService.suggestTags(title, description);
      setTagSuggestions(suggestions.tags);
    } catch {
      showToast('태그 제안에 실패했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setLoadingTags(false);
    }
  };

  const handleCategoryAccept = () => {
    if (categoryPrediction && onCategorySelect) {
      onCategorySelect(categoryPrediction.category);
      setCategoryPrediction(null);
    }
  };

  const handleTagSelect = (tag: string) => {
    if (onTagsSelect) {
      onTagsSelect([tag]);
      setTagSuggestions(prev => prev.filter(t => t !== tag));
    }
  };

  const handleAllTagsAccept = () => {
    if (onTagsSelect && tagSuggestions.length > 0) {
      onTagsSelect(tagSuggestions);
      setTagSuggestions([]);
    }
  };

  const findSimilarIdeas = async () => {
    if (!title && !description) {
      showToast('제목이나 설명을 먼저 입력해주세요.', 'warning');
      return;
    }

    setLoadingSimilar(true);
    try {
      const existingIdeas = ideas.map(idea => ({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        tags: idea.tags
      }));
      const results = await aiService.findSimilarIdeas(
        { title, description, tags },
        existingIdeas
      );
      setSimilarIdeas(results);
    } catch {
      showToast('유사 아이디어 검색에 실패했습니다.', 'error');
    } finally {
      setLoadingSimilar(false);
    }
  };

  const generateSWOT = async () => {
    if (!title && !description) {
      showToast('제목이나 설명을 먼저 입력해주세요.', 'warning');
      return;
    }

    setLoadingSWOT(true);
    try {
      const result = await aiService.generateSWOT({
        title,
        description,
        tags
      });
      setSWOTAnalysis(result);
    } catch {
      showToast('SWOT 분석 생성에 실패했습니다.', 'error');
    } finally {
      setLoadingSWOT(false);
    }
  };

  const getImprovements = async () => {
    if (!title && !description) {
      showToast('제목이나 설명을 먼저 입력해주세요.', 'warning');
      return;
    }

    setLoadingImprove(true);
    try {
      const result = await aiService.improveIdea(title, description);
      setImprovements(result);
    } catch {
      showToast('개선 제안 생성에 실패했습니다.', 'error');
    } finally {
      setLoadingImprove(false);
    }
  };

  const applyImprovedTitle = () => {
    if (improvements?.improvedTitle && onTitleChange) {
      onTitleChange(improvements.improvedTitle);
      setImprovements(prev => prev ? { ...prev, improvedTitle: undefined } : null);
    }
  };

  const applyImprovedDescription = () => {
    if (improvements?.improvedDescription && onDescriptionChange) {
      onDescriptionChange(improvements.improvedDescription);
      setImprovements(prev => prev ? { ...prev, improvedDescription: undefined } : null);
    }
  };

  if (!aiService.isAvailable()) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-accent">
        <Bot className="h-4 w-4" />
        AI 어시스턴트
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* 카테고리 제안 */}
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-primary">카테고리 제안</span>
            </div>
            <button
              onClick={suggestCategory}
              disabled={loadingCategory || (!title && !description)}
              className="btn-ghost px-3 py-1 text-xs rounded-lg hover:bg-hover transition-all disabled:opacity-50"
            >
              {loadingCategory ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Wand2 className="h-3 w-3" />
              )}
            </button>
          </div>

          {categoryPrediction && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
                <div>
                  <span className="text-sm font-bold text-primary-700">{categoryPrediction.category}</span>
                  <div className="text-xs text-primary-600 mt-1">
                    확신도: {Math.round(categoryPrediction.confidence * 100)}%
                  </div>
                </div>
                <button
                  onClick={handleCategoryAccept}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs font-medium"
                >
                  적용
                </button>
              </div>
            </div>
          )}

          {!categoryPrediction && !loadingCategory && (
            <p className="text-xs text-tertiary">
              제목이나 설명을 입력하면 AI가 적절한 카테고리를 제안합니다.
            </p>
          )}
        </div>

        {/* 태그 제안 */}
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-primary">태그 제안</span>
            </div>
            <button
              onClick={suggestTags}
              disabled={loadingTags || (!title && !description)}
              className="btn-ghost px-3 py-1 text-xs rounded-lg hover:bg-hover transition-all disabled:opacity-50"
            >
              {loadingTags ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Wand2 className="h-3 w-3" />
              )}
            </button>
          </div>

          {tagSuggestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {tagSuggestions.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => handleTagSelect(tag)}
                    className="inline-flex items-center px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-xs font-medium hover:bg-secondary-200 hover:scale-105 transition-all border border-secondary-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAllTagsAccept}
                className="w-full px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors text-xs font-medium"
              >
                모든 태그 적용
              </button>
            </div>
          )}

          {tagSuggestions.length === 0 && !loadingTags && (
            <p className="text-xs text-tertiary">
              제목이나 설명을 입력하면 AI가 관련 태그를 제안합니다.
            </p>
          )}
        </div>
      </div>

      {/* 고급 기능 토글 */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors w-full justify-center py-2"
      >
        {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        고급 AI 분석 {showAdvanced ? '숨기기' : '보기'}
      </button>

      {showAdvanced && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* 유사 아이디어 찾기 */}
          <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-primary">유사 아이디어 찾기</span>
              </div>
              <button
                onClick={findSimilarIdeas}
                disabled={loadingSimilar || (!title && !description)}
                className="btn-ghost px-3 py-1 text-xs rounded-lg hover:bg-hover transition-all disabled:opacity-50"
              >
                {loadingSimilar ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Wand2 className="h-3 w-3" />
                )}
              </button>
            </div>

            {similarIdeas.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {similarIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-medium text-blue-700 line-clamp-1">
                        {idea.title}
                      </span>
                      <span className="text-xs font-bold text-blue-600 ml-2">
                        {idea.similarity}%
                      </span>
                    </div>
                    {idea.matchedKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {idea.matchedKeywords.map((kw, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {similarIdeas.length === 0 && !loadingSimilar && (
              <p className="text-xs text-tertiary">
                기존 아이디어 중 유사한 것을 찾아 중복을 방지합니다.
              </p>
            )}
          </div>

          {/* SWOT 분석 */}
          <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-primary">SWOT 분석</span>
              </div>
              <button
                onClick={generateSWOT}
                disabled={loadingSWOT || (!title && !description)}
                className="btn-ghost px-3 py-1 text-xs rounded-lg hover:bg-hover transition-all disabled:opacity-50"
              >
                {loadingSWOT ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Wand2 className="h-3 w-3" />
                )}
              </button>
            </div>

            {swotAnalysis && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-1 font-semibold text-green-700 mb-1">
                    <TrendingUp className="h-3 w-3" /> 강점
                  </div>
                  <ul className="space-y-0.5">
                    {swotAnalysis.strengths.map((s, i) => (
                      <li key={i} className="text-green-600 line-clamp-2">• {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-2 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-1 font-semibold text-red-700 mb-1">
                    <AlertTriangle className="h-3 w-3" /> 약점
                  </div>
                  <ul className="space-y-0.5">
                    {swotAnalysis.weaknesses.map((w, i) => (
                      <li key={i} className="text-red-600 line-clamp-2">• {w}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-1 font-semibold text-blue-700 mb-1">
                    <TrendingUp className="h-3 w-3" /> 기회
                  </div>
                  <ul className="space-y-0.5">
                    {swotAnalysis.opportunities.map((o, i) => (
                      <li key={i} className="text-blue-600 line-clamp-2">• {o}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-1 font-semibold text-orange-700 mb-1">
                    <AlertTriangle className="h-3 w-3" /> 위협
                  </div>
                  <ul className="space-y-0.5">
                    {swotAnalysis.threats.map((t, i) => (
                      <li key={i} className="text-orange-600 line-clamp-2">• {t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {!swotAnalysis && !loadingSWOT && (
              <p className="text-xs text-tertiary">
                아이디어의 강점, 약점, 기회, 위협을 분석합니다.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 개선 제안 - 항상 표시 */}
      <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-primary">개선 제안</span>
          </div>
          <button
            onClick={getImprovements}
            disabled={loadingImprove || (!title && !description)}
            className="btn-ghost px-3 py-1 text-xs rounded-lg hover:bg-hover transition-all disabled:opacity-50"
          >
            {loadingImprove ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Wand2 className="h-3 w-3" />
            )}
          </button>
        </div>

        {improvements && (
          <div className="space-y-3">
            {/* 개선된 제목 */}
            {improvements.improvedTitle && onTitleChange && (
              <div className="p-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-xs font-medium text-amber-700">개선된 제목</span>
                    <p className="text-sm text-amber-900 mt-1">{improvements.improvedTitle}</p>
                  </div>
                  <button
                    onClick={applyImprovedTitle}
                    className="flex-shrink-0 p-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    title="적용"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* 개선된 설명 */}
            {improvements.improvedDescription && onDescriptionChange && (
              <div className="p-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-xs font-medium text-amber-700">개선된 설명</span>
                    <p className="text-sm text-amber-900 mt-1 whitespace-pre-wrap">{improvements.improvedDescription}</p>
                  </div>
                  <button
                    onClick={applyImprovedDescription}
                    className="flex-shrink-0 p-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    title="적용"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* 개선 제안 목록 */}
            {improvements.suggestions.length > 0 && (
              <div className="p-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                <span className="text-xs font-medium text-purple-700 flex items-center gap-1 mb-2">
                  <Lightbulb className="h-3 w-3" /> 개선 포인트
                </span>
                <ul className="space-y-1">
                  {improvements.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-xs text-purple-600 flex items-start gap-1.5">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!improvements && !loadingImprove && (
          <p className="text-xs text-tertiary">
            AI가 제목과 설명을 분석하여 개선 방안을 제안합니다.
          </p>
        )}
      </div>
    </div>
  );
}