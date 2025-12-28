/**
 * AI Service - Local implementation using keyword matching and pattern analysis.
 * Provides smart suggestions for idea categorization, tagging, and generation.
 * @module aiService
 */

/** Suggested idea structure from AI generation */
interface IdeaSuggestion {
  title: string;
  description: string;
  category: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

/** Category prediction result with confidence score */
interface CategoryPrediction {
  category: string;
  /** Confidence score between 0 and 1 */
  confidence: number;
}

/** Tag suggestion result */
interface TagSuggestion {
  tags: string[];
}

// 스마트 아이디어 데이터베이스 (무료)
const ideaSuggestions: IdeaSuggestion[] = [
  {
    title: "스마트 식물 관리 시스템",
    description: "IoT 센서를 활용하여 식물의 수분, 조도, 온도를 모니터링하고 자동으로 물을 주는 시스템",
    category: "기술",
    tags: ["IoT", "농업", "자동화", "모바일앱"],
    priority: "medium"
  },
  {
    title: "지역 맛집 추천 플랫폼",
    description: "사용자 위치 기반으로 숨은 맛집을 발굴하고 공유하는 소셜 플랫폼",
    category: "서비스",
    tags: ["위치기반", "음식", "소셜", "추천시스템"],
    priority: "high"
  },
  {
    title: "디지털 디톡스 앱",
    description: "스크린 타임을 관리하고 디지털 기기 사용을 줄이도록 도와주는 웰빙 앱",
    category: "헬스케어",
    tags: ["웰빙", "모바일앱", "행동변화", "건강"],
    priority: "medium"
  },
  {
    title: "AI 기반 개인 트레이너",
    description: "개인의 체력 수준과 목표에 맞춘 맞춤형 운동 계획을 제공하는 AI 트레이너",
    category: "헬스케어",
    tags: ["AI", "운동", "개인화", "건강관리"],
    priority: "high"
  },
  {
    title: "친환경 포장재 대여 서비스",
    description: "일회용 포장재 대신 재사용 가능한 친환경 포장재를 대여해주는 서비스",
    category: "환경",
    tags: ["친환경", "순환경제", "포장", "지속가능성"],
    priority: "medium"
  }
];

const categoryKeywords = {
  "기술": ["AI", "IoT", "블록체인", "VR", "AR", "머신러닝", "개발", "소프트웨어", "하드웨어", "프로그래밍", "앱", "웹", "플랫폼"],
  "비즈니스": ["창업", "투자", "마케팅", "영업", "전략", "수익", "비즈니스모델", "고객", "시장", "경영", "브랜딩"],
  "디자인": ["UI", "UX", "그래픽", "브랜딩", "로고", "웹디자인", "앱디자인", "사용자경험", "인터페이스", "시각디자인"],
  "교육": ["학습", "교육", "강의", "온라인", "이러닝", "스킬", "지식", "가르치기", "배우기", "교육과정"],
  "헬스케어": ["건강", "의료", "운동", "다이어트", "영양", "정신건강", "웰빙", "피트니스", "병원", "치료"],
  "환경": ["친환경", "지속가능", "재활용", "에너지", "탄소", "기후", "환경보호", "그린", "생태", "순환경제"],
  "서비스": ["플랫폼", "매칭", "예약", "배달", "공유", "렌탈", "구독", "커뮤니티", "소셜", "네트워킹"],
  "엔터테인먼트": ["게임", "영화", "음악", "콘텐츠", "미디어", "스트리밍", "SNS", "소셜미디어", "유튜브", "방송"]
};

/**
 * AI service for intelligent idea analysis and suggestions.
 * Uses local keyword matching algorithms for categorization and tagging.
 */
export const aiService = {
  /**
   * Automatically categorize an idea based on title and description.
   * Uses keyword matching against predefined category keywords.
   * @param title - The idea title
   * @param description - The idea description
   * @returns Category prediction with confidence score (0-1)
   * @throws Error if both title and description are empty
   */
  async categorizeIdea(title: string, description: string): Promise<CategoryPrediction> {
    return new Promise((resolve, reject) => {
      // 입력 검증
      if (!title && !description) {
        reject(new Error('제목 또는 설명이 필요합니다.'));
        return;
      }
      
      // 짧은 지연시간으로 실제 API 호출을 시뮬레이션
      setTimeout(() => {
        try {
          // 로컬 키워드 매칭 알고리즘 (무료)
          
          // 키워드 기반 분류
          const text = (title + " " + description).toLowerCase();
          const scores: Record<string, number> = {};
          
          Object.entries(categoryKeywords).forEach(([category, keywords]) => {
            scores[category] = keywords.reduce((score, keyword) => {
              return score + (text.includes(keyword.toLowerCase()) ? 1 : 0);
            }, 0);
          });
          
          const categoryEntries = Object.entries(scores);
          if (categoryEntries.length === 0) {
            resolve({ category: '기타', confidence: 0.3 });
            return;
          }
          
          const bestCategory = categoryEntries.reduce((a, b) => 
            scores[a[0]] > scores[b[0]] ? a : b
          );
          
          const maxScore = Math.max(...Object.values(scores));
          const confidence = maxScore > 0 ? Math.min(0.95, maxScore * 0.3 + 0.5) : 0.3;
          
          resolve({
            category: bestCategory[0],
            confidence: Math.round(confidence * 100) / 100
          });
        } catch (error) {
          reject(new Error('카테고리 분류 중 오류가 발생했습니다.'));
        }
      }, 800); // 800ms 지연
    });
  },

  /**
   * Suggest relevant tags based on idea title and description.
   * Extracts keywords from text and matches against known tag patterns.
   * @param title - The idea title
   * @param description - The idea description
   * @returns Suggested tags (maximum 5)
   * @throws Error if both title and description are empty
   */
  async suggestTags(title: string, description: string): Promise<TagSuggestion> {
    return new Promise((resolve, reject) => {
      // 입력 검증
      if (!title && !description) {
        reject(new Error('제목 또는 설명이 필요합니다.'));
        return;
      }
      
      // 짧은 지연시간으로 실제 API 호출을 시뮬레이션
      setTimeout(() => {
        try {
          // 로컬 패턴 분석 (무료)
          
          // 키워드 추출
          const text = (title + " " + description).toLowerCase();
          const suggestedTags: string[] = [];
          
          Object.values(categoryKeywords).flat().forEach((keyword: string) => {
            if (text.includes(keyword.toLowerCase()) && !suggestedTags.includes(keyword)) {
              suggestedTags.push(keyword);
            }
          });
          
          // 기본 태그가 없는 경우 일반적인 태그 추가
          if (suggestedTags.length === 0) {
            const fallbackTags = ["아이디어", "프로젝트", "혁신"];
            suggestedTags.push(...fallbackTags);
          }
          
          // 추가 일반적인 태그들
          const commonTags = ["혁신", "창의", "솔루션", "아이디어", "프로젝트"];
          commonTags.forEach(tag => {
            if (Math.random() > 0.7 && !suggestedTags.includes(tag)) {
              suggestedTags.push(tag);
            }
          });
          
          resolve({
            tags: suggestedTags.slice(0, 5) // 최대 5개 태그
          });
        } catch (error) {
          reject(new Error('태그 제안 중 오류가 발생했습니다.'));
        }
      }, 600); // 600ms 지연
    });
  },

  /**
   * Generate idea suggestions based on optional keyword and category filters.
   * Returns shuffled results from the local idea database.
   * @param keyword - Optional keyword to filter suggestions
   * @param category - Optional category to filter suggestions
   * @returns Array of suggested ideas (maximum 5)
   */
  async generateIdeaSuggestions(keyword?: string, category?: string): Promise<IdeaSuggestion[]> {
    // 실제 환경에서는 OpenAI API 호출
    
    // 스마트 아이디어 데이터베이스에서 제안
    let suggestions = [...ideaSuggestions];
    
    if (category) {
      suggestions = suggestions.filter(s => s.category === category);
    }
    
    if (keyword) {
      const keywordLower = keyword.toLowerCase();
      suggestions = suggestions.filter(s => 
        s.title.toLowerCase().includes(keywordLower) ||
        s.description.toLowerCase().includes(keywordLower) ||
        s.tags.some(tag => tag.toLowerCase().includes(keywordLower))
      );
    }
    
    // Fisher-Yates 셔플 알고리즘으로 랜덤하게 섞기
    const shuffled = [...suggestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, Math.min(5, shuffled.length));
  },

  /**
   * Analyze an idea and provide improvement suggestions.
   * Checks for completeness and provides actionable recommendations.
   * @param title - The idea title to analyze
   * @param description - The idea description to analyze
   * @returns Improvement suggestions and optionally improved title/description
   */
  async improveIdea(title: string, description: string): Promise<{
    improvedTitle?: string;
    improvedDescription?: string;
    suggestions: string[];
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 로컬 분석 기반 개선 제안
        const text = (title + " " + description).toLowerCase();
        const suggestions: string[] = [];
        
        // 스마트 분석
        if (title.length < 10) suggestions.push("제목을 더 구체적으로 작성해보세요");
        if (description.length < 50) suggestions.push("설명을 더 자세히 작성해보세요");
        if (!text.includes("사용자") && !text.includes("고객")) {
          suggestions.push("타겟 사용자나 고객을 명확히 정의해보세요");
        }
        if (!text.includes("기술") && !text.includes("방법")) {
          suggestions.push("기술적 구현 방법을 추가로 설명해보세요");
        }
        if (!text.includes("수익") && !text.includes("비즈니스")) {
          suggestions.push("비즈니스 모델을 고려해보세요");
        }
        
        // 기본 제안들로 채우기
        const defaults = ["경쟁 분석을 추가해보세요", "예상 문제점을 포함해보세요", "시장성을 검토해보세요"];
        defaults.forEach(def => {
          if (suggestions.length < 3) suggestions.push(def);
        });
        
        resolve({
          suggestions: suggestions.slice(0, 3),
          improvedTitle: title.length < 10 ? `${title} - 스마트 버전` : undefined,
          improvedDescription: description.length < 50 ? `${description}\n\n💡 이 아이디어는 사용자 중심의 접근으로 실질적 가치를 제공할 수 있습니다.` : undefined
        });
      }, 500);
    });
  },

  /**
   * Check if the AI service is available.
   * Always returns true as this is a local implementation.
   * @returns true (always available)
   */
  isAvailable(): boolean {
    return true;
  }
};