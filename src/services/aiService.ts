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

// 스마트 아이디어 데이터베이스 (확장)
const ideaSuggestions: IdeaSuggestion[] = [
  // 기술
  {
    title: "스마트 식물 관리 시스템",
    description: "IoT 센서를 활용하여 식물의 수분, 조도, 온도를 모니터링하고 자동으로 물을 주는 시스템",
    category: "기술",
    tags: ["IoT", "농업", "자동화", "모바일앱"],
    priority: "medium"
  },
  {
    title: "AI 코드 리뷰 도구",
    description: "머신러닝을 활용해 코드 품질을 분석하고 개선점을 제안하는 개발자 도구",
    category: "기술",
    tags: ["AI", "개발", "코드리뷰", "자동화"],
    priority: "high"
  },
  {
    title: "블록체인 기반 디지털 인증서",
    description: "위변조가 불가능한 블록체인 기술로 학력, 자격증 등을 인증하는 플랫폼",
    category: "기술",
    tags: ["블록체인", "인증", "보안", "플랫폼"],
    priority: "medium"
  },
  {
    title: "AR 가구 배치 시뮬레이터",
    description: "증강현실로 구매 전 가구를 실제 공간에 배치해볼 수 있는 앱",
    category: "기술",
    tags: ["AR", "인테리어", "쇼핑", "모바일앱"],
    priority: "medium"
  },
  // 서비스
  {
    title: "지역 맛집 추천 플랫폼",
    description: "사용자 위치 기반으로 숨은 맛집을 발굴하고 공유하는 소셜 플랫폼",
    category: "서비스",
    tags: ["위치기반", "음식", "소셜", "추천시스템"],
    priority: "high"
  },
  {
    title: "시니어 동반자 매칭 서비스",
    description: "어르신들에게 말벗, 외출 동행, 심부름 등을 제공하는 청년 매칭 플랫폼",
    category: "서비스",
    tags: ["시니어", "매칭", "커뮤니티", "소셜"],
    priority: "high"
  },
  {
    title: "반려동물 돌봄 공유 플랫폼",
    description: "여행이나 출장 시 이웃에게 반려동물 돌봄을 맡길 수 있는 공유 서비스",
    category: "서비스",
    tags: ["반려동물", "공유경제", "커뮤니티", "매칭"],
    priority: "medium"
  },
  {
    title: "재능 교환 플랫폼",
    description: "돈 대신 재능을 교환하는 플랫폼. 영어 레슨과 기타 레슨을 교환하는 식",
    category: "서비스",
    tags: ["공유경제", "교육", "커뮤니티", "매칭"],
    priority: "medium"
  },
  // 헬스케어
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
    title: "수면 품질 분석 앱",
    description: "수면 패턴을 분석하고 개선 방법을 제안하는 스마트 수면 관리 앱",
    category: "헬스케어",
    tags: ["수면", "건강", "AI", "모바일앱"],
    priority: "medium"
  },
  {
    title: "정신건강 자가진단 플랫폼",
    description: "AI 기반 심리 상담과 전문가 연결을 제공하는 멘탈 케어 서비스",
    category: "헬스케어",
    tags: ["정신건강", "AI", "상담", "웰빙"],
    priority: "high"
  },
  // 환경
  {
    title: "친환경 포장재 대여 서비스",
    description: "일회용 포장재 대신 재사용 가능한 친환경 포장재를 대여해주는 서비스",
    category: "환경",
    tags: ["친환경", "순환경제", "포장", "지속가능성"],
    priority: "medium"
  },
  {
    title: "탄소 발자국 추적 앱",
    description: "일상 활동의 탄소 배출량을 측정하고 감축 방법을 제안하는 앱",
    category: "환경",
    tags: ["친환경", "탄소중립", "모바일앱", "지속가능성"],
    priority: "medium"
  },
  {
    title: "중고 의류 업사이클링 플랫폼",
    description: "헌 옷을 수거하여 새 제품으로 재탄생시키는 순환 패션 서비스",
    category: "환경",
    tags: ["친환경", "패션", "순환경제", "업사이클링"],
    priority: "medium"
  },
  // 교육
  {
    title: "게이미피케이션 학습 플랫폼",
    description: "게임 요소를 활용해 학습 동기를 높이는 교육 서비스",
    category: "교육",
    tags: ["교육", "게이미피케이션", "이러닝", "동기부여"],
    priority: "high"
  },
  {
    title: "AI 언어 교환 파트너",
    description: "AI가 원어민처럼 대화하며 외국어 학습을 도와주는 챗봇",
    category: "교육",
    tags: ["AI", "언어학습", "챗봇", "교육"],
    priority: "high"
  },
  {
    title: "직장인 마이크로 러닝 앱",
    description: "출퇴근 시간에 5분 단위로 배우는 비즈니스 스킬 학습 앱",
    category: "교육",
    tags: ["교육", "직장인", "모바일앱", "마이크로러닝"],
    priority: "medium"
  },
  // 비즈니스
  {
    title: "소상공인 마케팅 자동화 도구",
    description: "SNS 콘텐츠 생성부터 광고 집행까지 자동화하는 마케팅 솔루션",
    category: "비즈니스",
    tags: ["마케팅", "자동화", "소상공인", "AI"],
    priority: "high"
  },
  {
    title: "프리랜서 프로젝트 관리 플랫폼",
    description: "계약서, 인보이스, 일정 관리를 한 곳에서 처리하는 프리랜서 도구",
    category: "비즈니스",
    tags: ["프리랜서", "생산성", "플랫폼", "관리"],
    priority: "medium"
  },
  {
    title: "구독 경제 분석 대시보드",
    description: "개인의 모든 구독 서비스를 한눈에 보고 최적화하는 관리 도구",
    category: "비즈니스",
    tags: ["구독", "재무관리", "분석", "대시보드"],
    priority: "medium"
  },
  // 엔터테인먼트
  {
    title: "AI 작곡 협업 도구",
    description: "AI가 멜로디와 화성을 제안하고 함께 작곡하는 음악 창작 도구",
    category: "엔터테인먼트",
    tags: ["AI", "음악", "창작", "협업"],
    priority: "medium"
  },
  {
    title: "인터랙티브 스토리 게임 플랫폼",
    description: "사용자 선택에 따라 스토리가 바뀌는 인터랙티브 소설/게임 플랫폼",
    category: "엔터테인먼트",
    tags: ["게임", "스토리", "인터랙티브", "콘텐츠"],
    priority: "medium"
  },
  {
    title: "버추얼 콘서트 플랫폼",
    description: "VR/AR로 실제 콘서트처럼 즐기는 가상 공연 서비스",
    category: "엔터테인먼트",
    tags: ["VR", "음악", "공연", "메타버스"],
    priority: "high"
  },
  // 디자인
  {
    title: "AI 로고 생성기",
    description: "브랜드 컨셉을 입력하면 AI가 다양한 로고 디자인을 제안하는 도구",
    category: "디자인",
    tags: ["AI", "로고", "브랜딩", "디자인"],
    priority: "high"
  },
  {
    title: "컬러 팔레트 추천 서비스",
    description: "이미지나 키워드를 기반으로 어울리는 색상 조합을 추천하는 도구",
    category: "디자인",
    tags: ["디자인", "색상", "AI", "도구"],
    priority: "low"
  }
];

// 동적 아이디어 생성을 위한 템플릿
const ideaTemplates = {
  concepts: [
    "AI 기반", "블록체인", "IoT", "AR/VR", "음성인식", "자동화", "개인화", "실시간",
    "소셜", "구독형", "공유경제", "온디맨드", "P2P", "클라우드", "모바일"
  ],
  domains: [
    "헬스케어", "교육", "금융", "물류", "농업", "부동산", "여행", "음식",
    "패션", "뷰티", "육아", "반려동물", "시니어", "환경", "에너지"
  ],
  actions: [
    "추천 시스템", "매칭 플랫폼", "관리 도구", "분석 대시보드", "자동화 서비스",
    "커뮤니티", "마켓플레이스", "예약 시스템", "트래킹 앱", "컨설팅 서비스"
  ],
  values: [
    "시간 절약", "비용 절감", "편의성 향상", "건강 개선", "생산성 증가",
    "환경 보호", "사회적 연결", "개인화 경험", "접근성 향상", "안전성 강화"
  ]
};

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
   * Combines database lookup with dynamic idea generation.
   * @param keyword - Optional keyword to filter suggestions
   * @param category - Optional category to filter suggestions
   * @returns Array of suggested ideas (maximum 5)
   */
  async generateIdeaSuggestions(keyword?: string, category?: string): Promise<IdeaSuggestion[]> {
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

    // 데이터베이스에서 충분한 결과가 없으면 동적 생성
    if (suggestions.length < 3) {
      const dynamicIdeas = this.generateDynamicIdeas(keyword, category, 3 - suggestions.length);
      suggestions = [...suggestions, ...dynamicIdeas];
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
   * Generate dynamic ideas based on templates
   */
  generateDynamicIdeas(keyword?: string, category?: string, count: number = 3): IdeaSuggestion[] {
    const results: IdeaSuggestion[] = [];
    const usedCombinations = new Set<string>();

    for (let i = 0; i < count * 3 && results.length < count; i++) {
      const concept = ideaTemplates.concepts[Math.floor(Math.random() * ideaTemplates.concepts.length)];
      const domain = keyword || ideaTemplates.domains[Math.floor(Math.random() * ideaTemplates.domains.length)];
      const action = ideaTemplates.actions[Math.floor(Math.random() * ideaTemplates.actions.length)];
      const value = ideaTemplates.values[Math.floor(Math.random() * ideaTemplates.values.length)];

      const combinationKey = `${concept}-${domain}-${action}`;
      if (usedCombinations.has(combinationKey)) continue;
      usedCombinations.add(combinationKey);

      const title = `${concept} ${domain} ${action}`;
      const description = `${domain} 분야에서 ${concept} 기술을 활용한 ${action}입니다. 주요 가치는 ${value}이며, 사용자에게 새로운 경험을 제공합니다.`;

      // 카테고리 결정
      let ideaCategory = category || '서비스';
      if (concept.includes('AI') || concept.includes('IoT') || concept.includes('블록체인')) {
        ideaCategory = '기술';
      } else if (domain.includes('헬스') || domain.includes('건강')) {
        ideaCategory = '헬스케어';
      } else if (domain.includes('교육')) {
        ideaCategory = '교육';
      } else if (domain.includes('환경') || domain.includes('에너지')) {
        ideaCategory = '환경';
      }

      results.push({
        title,
        description,
        category: ideaCategory,
        tags: [concept.replace(' ', ''), domain, action.split(' ')[0]],
        priority: Math.random() > 0.5 ? 'medium' : 'high'
      });
    }

    return results;
  },

  /**
   * Find similar ideas based on text similarity
   * @param targetIdea - The idea to find similarities for
   * @param existingIdeas - List of existing ideas to compare against
   * @returns Array of similar ideas with similarity scores
   */
  async findSimilarIdeas(
    targetIdea: { title: string; description: string; tags?: string[] },
    existingIdeas: Array<{ id: string; title: string; description: string; tags: string[] }>
  ): Promise<Array<{ id: string; title: string; similarity: number; matchedKeywords: string[] }>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const targetText = `${targetIdea.title} ${targetIdea.description} ${(targetIdea.tags || []).join(' ')}`.toLowerCase();
        const targetWords = new Set(targetText.split(/\s+/).filter(w => w.length > 1));

        const similarities = existingIdeas.map(idea => {
          const ideaText = `${idea.title} ${idea.description} ${idea.tags.join(' ')}`.toLowerCase();
          const ideaWords = new Set(ideaText.split(/\s+/).filter(w => w.length > 1));

          // 교집합 계산
          const matchedKeywords: string[] = [];
          targetWords.forEach(word => {
            if (ideaWords.has(word) && word.length > 2) {
              matchedKeywords.push(word);
            }
          });

          // Jaccard 유사도
          const union = new Set([...targetWords, ...ideaWords]);
          const similarity = matchedKeywords.length / Math.max(union.size, 1);

          return {
            id: idea.id,
            title: idea.title,
            similarity: Math.round(similarity * 100),
            matchedKeywords: matchedKeywords.slice(0, 5)
          };
        });

        // 유사도 높은 순으로 정렬, 자기 자신 제외
        const filtered = similarities
          .filter(s => s.similarity > 10 && s.similarity < 100)
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 5);

        resolve(filtered);
      }, 500);
    });
  },

  /**
   * Generate SWOT analysis for an idea
   * @param idea - The idea to analyze
   * @returns SWOT analysis results
   */
  async generateSWOT(idea: {
    title: string;
    description: string;
    category?: string;
    tags?: string[];
  }): Promise<{
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const text = `${idea.title} ${idea.description}`.toLowerCase();
        const tags = idea.tags || [];

        const analysis = {
          strengths: [] as string[],
          weaknesses: [] as string[],
          opportunities: [] as string[],
          threats: [] as string[]
        };

        // 강점 분석
        if (text.includes('ai') || text.includes('인공지능')) {
          analysis.strengths.push('AI 기술을 활용한 차별화된 서비스 제공 가능');
        }
        if (text.includes('자동화') || text.includes('자동')) {
          analysis.strengths.push('자동화를 통한 효율성 및 비용 절감');
        }
        if (text.includes('개인화') || text.includes('맞춤')) {
          analysis.strengths.push('개인화된 경험으로 사용자 만족도 향상');
        }
        if (text.includes('모바일') || text.includes('앱')) {
          analysis.strengths.push('모바일 접근성으로 사용자 도달 용이');
        }
        if (text.includes('플랫폼')) {
          analysis.strengths.push('플랫폼 비즈니스 모델로 확장성 확보');
        }
        if (analysis.strengths.length === 0) {
          analysis.strengths.push('새로운 시장 진입 기회');
          analysis.strengths.push('기존 문제에 대한 혁신적 접근');
        }

        // 약점 분석
        if (text.includes('ai') || text.includes('블록체인')) {
          analysis.weaknesses.push('기술 개발에 높은 초기 투자 필요');
        }
        if (text.includes('플랫폼') || text.includes('매칭')) {
          analysis.weaknesses.push('초기 사용자 확보(치킨-에그 문제)가 관건');
        }
        if (tags.length < 3) {
          analysis.weaknesses.push('명확한 타겟 시장 정의 필요');
        }
        if (!text.includes('수익') && !text.includes('구독') && !text.includes('수수료')) {
          analysis.weaknesses.push('수익 모델 구체화 필요');
        }
        if (analysis.weaknesses.length < 2) {
          analysis.weaknesses.push('경쟁사 대비 차별화 전략 수립 필요');
        }

        // 기회 분석
        if (text.includes('헬스') || text.includes('건강') || text.includes('웰빙')) {
          analysis.opportunities.push('건강에 대한 관심 증가로 시장 성장 예상');
        }
        if (text.includes('환경') || text.includes('친환경') || text.includes('탄소')) {
          analysis.opportunities.push('ESG 트렌드와 환경 규제 강화로 수요 증가');
        }
        if (text.includes('시니어') || text.includes('노인')) {
          analysis.opportunities.push('고령화 사회 진입으로 시니어 시장 확대');
        }
        if (text.includes('ai') || text.includes('디지털')) {
          analysis.opportunities.push('디지털 전환 가속화로 기술 수용도 증가');
        }
        if (analysis.opportunities.length < 2) {
          analysis.opportunities.push('모바일 사용 증가로 접근성 향상');
          analysis.opportunities.push('MZ세대의 새로운 서비스 수용 의지');
        }

        // 위협 분석
        if (text.includes('플랫폼') || text.includes('앱')) {
          analysis.threats.push('대기업의 유사 서비스 출시 가능성');
        }
        if (text.includes('ai') || text.includes('데이터')) {
          analysis.threats.push('개인정보보호 규제 강화');
        }
        if (text.includes('구독') || text.includes('서비스')) {
          analysis.threats.push('경기 침체 시 구독 서비스 해지 증가 우려');
        }
        if (analysis.threats.length < 2) {
          analysis.threats.push('유사 서비스와의 가격 경쟁');
          analysis.threats.push('기술 변화에 따른 빠른 대응 필요');
        }

        // 각 항목 최대 3개로 제한
        resolve({
          strengths: analysis.strengths.slice(0, 3),
          weaknesses: analysis.weaknesses.slice(0, 3),
          opportunities: analysis.opportunities.slice(0, 3),
          threats: analysis.threats.slice(0, 3)
        });
      }, 800);
    });
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
   * Generate brainstorming responses based on user message and context
   * @param message - User's brainstorming message
   * @param context - Optional context about the current idea
   * @returns AI response with suggestions
   */
  async brainstorm(
    message: string,
    context?: { title?: string; description?: string; category?: string }
  ): Promise<{
    response: string;
    suggestions?: string[];
    questions?: string[];
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerMessage = message.toLowerCase();
        let response = '';
        const suggestions: string[] = [];
        const questions: string[] = [];

        // 질문 유형 분석
        if (lowerMessage.includes('어떻게') || lowerMessage.includes('방법')) {
          response = '좋은 질문이에요! 실행 방법에 대해 생각해보면:';
          suggestions.push('MVP(최소 기능 제품)부터 시작해 점진적으로 발전시켜 보세요');
          suggestions.push('비슷한 서비스를 벤치마킹하고 차별화 포인트를 찾아보세요');
          suggestions.push('타겟 사용자에게 직접 인터뷰하여 니즈를 파악해보세요');
          questions.push('초기 타겟 시장은 어떻게 정의하실 건가요?');
        } else if (lowerMessage.includes('수익') || lowerMessage.includes('비즈니스') || lowerMessage.includes('돈')) {
          response = '비즈니스 모델에 대해 고민하고 계시군요! 몇 가지 옵션을 제안드립니다:';
          suggestions.push('구독 모델: 월정액으로 프리미엄 기능 제공');
          suggestions.push('프리미엄 모델: 기본 무료 + 고급 기능 유료');
          suggestions.push('수수료 모델: 거래/매칭당 수수료 부과');
          suggestions.push('광고 모델: 무료 서비스 + 타겟 광고');
          questions.push('타겟 고객이 지불 의향이 있는 가격대는 얼마일까요?');
        } else if (lowerMessage.includes('문제') || lowerMessage.includes('리스크') || lowerMessage.includes('위험')) {
          response = '잠재적 문제를 미리 파악하는 것은 현명한 접근입니다:';
          suggestions.push('기술적 리스크: 구현 가능성과 확장성 검토');
          suggestions.push('시장 리스크: 경쟁 환경과 진입 장벽 분석');
          suggestions.push('운영 리스크: 초기 팀 구성과 자원 확보 계획');
          questions.push('가장 우려되는 리스크는 무엇인가요?');
        } else if (lowerMessage.includes('경쟁') || lowerMessage.includes('차별화')) {
          response = '경쟁 우위를 확보하기 위한 전략을 생각해볼까요:';
          suggestions.push('기술 차별화: 더 나은 AI/UX로 사용자 경험 개선');
          suggestions.push('가격 차별화: 더 합리적인 가격 정책');
          suggestions.push('서비스 차별화: 특화된 고객 지원 제공');
          suggestions.push('니치 전략: 특정 세그먼트에 집중');
          questions.push('주요 경쟁사의 약점은 무엇인가요?');
        } else if (lowerMessage.includes('타겟') || lowerMessage.includes('고객') || lowerMessage.includes('사용자')) {
          response = '타겟 고객을 정의하는 것은 매우 중요합니다:';
          suggestions.push('페르소나 작성: 이상적인 고객의 구체적인 프로필 정의');
          suggestions.push('시장 세분화: 연령, 직업, 관심사 등으로 분류');
          suggestions.push('얼리어답터 발굴: 초기 사용자가 될 그룹 식별');
          questions.push('이 서비스가 가장 필요한 사람은 누구일까요?');
        } else if (lowerMessage.includes('아이디어') || lowerMessage.includes('발전') || lowerMessage.includes('확장')) {
          response = '아이디어를 발전시키는 좋은 방법들이 있어요:';
          suggestions.push('SCAMPER 기법 활용: 대체, 결합, 적용, 수정, 활용, 제거, 재배열');
          suggestions.push('마인드맵 작성: 핵심 아이디어에서 연관 개념 확장');
          suggestions.push('역발상: "만약 반대로 한다면?" 질문');
          questions.push('현재 아이디어에서 가장 핵심적인 가치는 무엇인가요?');
        } else {
          // 컨텍스트가 있는 경우 관련 응답
          if (context?.title || context?.category) {
            response = `"${context?.title || context?.category}" 관련해서 함께 브레인스토밍해보겠습니다:`;
            suggestions.push('핵심 가치 정의: 이 아이디어가 해결하는 문제는?');
            suggestions.push('사용자 여정: 사용자가 서비스를 어떻게 경험할지 상상해보세요');
            suggestions.push('MVP 정의: 최소한으로 필요한 핵심 기능은?');
          } else {
            response = '좋아요! 함께 생각해볼까요:';
            suggestions.push('더 구체적인 목표나 질문이 있으시면 알려주세요');
            suggestions.push('아이디어의 핵심 가치에 대해 설명해주세요');
          }
          questions.push('어떤 부분에 대해 더 깊이 논의하고 싶으신가요?');
        }

        resolve({ response, suggestions, questions });
      }, 600);
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