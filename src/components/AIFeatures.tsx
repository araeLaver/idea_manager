import { useState } from 'react';
import { Bot, Tag, FolderOpen, Wand2, Loader2 } from 'lucide-react';
import { aiService } from '../services/aiService';

interface AIFeaturesProps {
  title: string;
  description: string;
  onCategorySelect?: (category: string) => void;
  onTagsSelect?: (tags: string[]) => void;
}

export function AIFeatures({ title, description, onCategorySelect, onTagsSelect }: AIFeaturesProps) {
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [categoryPrediction, setCategoryPrediction] = useState<{ category: string; confidence: number } | null>(null);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);

  const suggestCategory = async () => {
    if (!title && !description) {
      alert('제목이나 설명을 먼저 입력해주세요.');
      return;
    }

    setLoadingCategory(true);
    try {
      const prediction = await aiService.categorizeIdea(title, description);
      setCategoryPrediction(prediction);
    } catch {
      alert('카테고리 예측에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoadingCategory(false);
    }
  };

  const suggestTags = async () => {
    if (!title && !description) {
      alert('제목이나 설명을 먼저 입력해주세요.');
      return;
    }

    setLoadingTags(true);
    try {
      const suggestions = await aiService.suggestTags(title, description);
      setTagSuggestions(suggestions.tags);
    } catch {
      alert('태그 제안에 실패했습니다. 다시 시도해주세요.');
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
    </div>
  );
}