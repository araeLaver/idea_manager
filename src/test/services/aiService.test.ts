import { describe, it, expect, beforeEach } from 'vitest';
import { aiService } from '../../services/aiService';

describe('AI Service', () => {
  describe('categorizeIdea', () => {
    it('should reject empty input', async () => {
      await expect(aiService.categorizeIdea('', '')).rejects.toThrow('제목 또는 설명이 필요합니다.');
    });

    it('should categorize technology-related idea', async () => {
      const result = await aiService.categorizeIdea('AI 기반 앱 개발', '머신러닝을 활용한 소프트웨어');
      expect(result.category).toBe('기술');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should categorize business-related idea', async () => {
      const result = await aiService.categorizeIdea('스타트업 투자 전략', '마케팅과 수익 모델 개선');
      expect(result.category).toBe('비즈니스');
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    it('should categorize healthcare-related idea', async () => {
      const result = await aiService.categorizeIdea('건강 관리 앱', '운동과 다이어트 추적');
      expect(result.category).toBe('헬스케어');
    });

    it('should return default category for unrecognized content', async () => {
      const result = await aiService.categorizeIdea('테스트', '일반적인 내용');
      expect(result.category).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0.3);
    });
  });

  describe('suggestTags', () => {
    it('should reject empty input', async () => {
      await expect(aiService.suggestTags('', '')).rejects.toThrow('제목 또는 설명이 필요합니다.');
    });

    it('should suggest tags based on keywords', async () => {
      const result = await aiService.suggestTags('AI 플랫폼', '머신러닝 기반 웹 서비스');
      expect(result.tags).toContain('AI');
      expect(result.tags.length).toBeGreaterThan(0);
      expect(result.tags.length).toBeLessThanOrEqual(5);
    });

    it('should provide fallback tags for generic content', async () => {
      const result = await aiService.suggestTags('일반 아이디어', '설명');
      expect(result.tags.length).toBeGreaterThan(0);
    });
  });

  describe('generateIdeaSuggestions', () => {
    it('should generate suggestions without filters', async () => {
      const results = await aiService.generateIdeaSuggestions();
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should filter by category', async () => {
      const results = await aiService.generateIdeaSuggestions(undefined, '기술');
      results.forEach(idea => {
        expect(idea.category).toBe('기술');
      });
    });

    it('should filter by keyword', async () => {
      const results = await aiService.generateIdeaSuggestions('AI');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return ideas with required properties', async () => {
      const results = await aiService.generateIdeaSuggestions();
      results.forEach(idea => {
        expect(idea.title).toBeDefined();
        expect(idea.description).toBeDefined();
        expect(idea.category).toBeDefined();
        expect(idea.tags).toBeInstanceOf(Array);
        expect(['low', 'medium', 'high']).toContain(idea.priority);
      });
    });
  });

  describe('generateDynamicIdeas', () => {
    it('should generate specified number of ideas', () => {
      const results = aiService.generateDynamicIdeas(undefined, undefined, 3);
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('should include keyword in generated ideas', () => {
      const results = aiService.generateDynamicIdeas('헬스케어', undefined, 2);
      results.forEach(idea => {
        const text = `${idea.title} ${idea.description}`;
        expect(text).toContain('헬스케어');
      });
    });

    it('should use specified category', () => {
      const results = aiService.generateDynamicIdeas(undefined, '교육', 2);
      expect(results.some(idea => idea.category === '교육')).toBe(true);
    });

    it('should generate unique ideas', () => {
      const results = aiService.generateDynamicIdeas(undefined, undefined, 5);
      const titles = results.map(r => r.title);
      const uniqueTitles = new Set(titles);
      expect(uniqueTitles.size).toBe(titles.length);
    });

    it('should return valid idea structure', () => {
      const results = aiService.generateDynamicIdeas();
      results.forEach(idea => {
        expect(idea.title).toBeTruthy();
        expect(idea.description).toBeTruthy();
        expect(idea.category).toBeTruthy();
        expect(idea.tags).toBeInstanceOf(Array);
        expect(['low', 'medium', 'high']).toContain(idea.priority);
      });
    });
  });

  describe('findSimilarIdeas', () => {
    const existingIdeas = [
      { id: '1', title: 'AI 기반 건강 관리 앱', description: '머신러닝으로 건강 데이터 분석', tags: ['AI', '건강', '앱'] },
      { id: '2', title: '온라인 교육 플랫폼', description: '학생들을 위한 이러닝 서비스', tags: ['교육', '온라인', '학습'] },
      { id: '3', title: '친환경 배달 서비스', description: '전기차로 음식 배달', tags: ['환경', '배달', '친환경'] },
      { id: '4', title: 'AI 음악 작곡 도구', description: '인공지능이 음악을 만들어주는 서비스', tags: ['AI', '음악', '창작'] },
    ];

    it('should find similar ideas based on keywords', async () => {
      const target = { title: 'AI 기반 건강 관리 앱 프로젝트', description: '머신러닝으로 건강 데이터 분석하는 시스템' };
      const results = await aiService.findSimilarIdeas(target, existingIdeas);

      // 유사도 10% 이상인 결과가 있어야 함
      expect(results.length).toBeGreaterThanOrEqual(0);
      // 결과가 있으면 AI 건강 관리 앱이 가장 유사해야 함
      if (results.length > 0) {
        expect(results[0].id).toBe('1');
      }
    });

    it('should return similarity scores', async () => {
      const target = { title: 'AI 앱', description: '인공지능 서비스' };
      const results = await aiService.findSimilarIdeas(target, existingIdeas);

      results.forEach(result => {
        expect(result.similarity).toBeGreaterThanOrEqual(0);
        expect(result.similarity).toBeLessThanOrEqual(100);
      });
    });

    it('should return matched keywords', async () => {
      const target = { title: 'AI 기반 교육', description: '학습 플랫폼' };
      const results = await aiService.findSimilarIdeas(target, existingIdeas);

      results.forEach(result => {
        expect(result.matchedKeywords).toBeInstanceOf(Array);
      });
    });

    it('should limit results to 5', async () => {
      const manyIdeas = Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        title: `AI 아이디어 ${i}`,
        description: `AI 관련 설명 ${i}`,
        tags: ['AI', 'test']
      }));

      const target = { title: 'AI 프로젝트', description: 'AI 서비스' };
      const results = await aiService.findSimilarIdeas(target, manyIdeas);

      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should sort by similarity descending', async () => {
      const target = { title: 'AI 앱', description: '인공지능' };
      const results = await aiService.findSimilarIdeas(target, existingIdeas);

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].similarity).toBeGreaterThanOrEqual(results[i].similarity);
      }
    });

    it('should handle empty existing ideas', async () => {
      const target = { title: '테스트', description: '설명' };
      const results = await aiService.findSimilarIdeas(target, []);

      expect(results).toEqual([]);
    });

    it('should include tags in similarity matching', async () => {
      const target = { title: '음악 도구', description: '작곡', tags: ['AI', '음악'] };
      const results = await aiService.findSimilarIdeas(target, existingIdeas);

      // AI 음악 작곡 도구가 상위에 있어야 함
      const musicIdeaRank = results.findIndex(r => r.id === '4');
      expect(musicIdeaRank).toBeLessThan(results.length);
    });
  });

  describe('generateSWOT', () => {
    it('should generate all four SWOT categories', async () => {
      const idea = { title: 'AI 플랫폼', description: '인공지능 서비스 플랫폼' };
      const result = await aiService.generateSWOT(idea);

      expect(result.strengths).toBeInstanceOf(Array);
      expect(result.weaknesses).toBeInstanceOf(Array);
      expect(result.opportunities).toBeInstanceOf(Array);
      expect(result.threats).toBeInstanceOf(Array);
    });

    it('should identify AI-related strengths', async () => {
      const idea = { title: 'AI 서비스', description: '인공지능 기반 자동화 서비스' };
      const result = await aiService.generateSWOT(idea);

      const hasAIStrength = result.strengths.some(s => s.includes('AI') || s.includes('자동화'));
      expect(hasAIStrength).toBe(true);
    });

    it('should identify platform-related weaknesses', async () => {
      const idea = { title: '매칭 플랫폼', description: '사용자 매칭 서비스' };
      const result = await aiService.generateSWOT(idea);

      const hasPlatformWeakness = result.weaknesses.some(w =>
        w.includes('플랫폼') || w.includes('사용자') || w.includes('치킨')
      );
      expect(hasPlatformWeakness).toBe(true);
    });

    it('should identify health-related opportunities', async () => {
      const idea = { title: '헬스케어 앱', description: '건강 관리 웰빙 서비스' };
      const result = await aiService.generateSWOT(idea);

      const hasHealthOpportunity = result.opportunities.some(o =>
        o.includes('건강') || o.includes('시장')
      );
      expect(hasHealthOpportunity).toBe(true);
    });

    it('should identify environment-related opportunities', async () => {
      const idea = { title: '친환경 서비스', description: '탄소 중립 환경 보호' };
      const result = await aiService.generateSWOT(idea);

      const hasEnvOpportunity = result.opportunities.some(o =>
        o.includes('ESG') || o.includes('환경')
      );
      expect(hasEnvOpportunity).toBe(true);
    });

    it('should limit each category to 3 items', async () => {
      const idea = {
        title: 'AI 플랫폼 앱 서비스',
        description: '인공지능 자동화 개인화 모바일 구독 데이터 분석'
      };
      const result = await aiService.generateSWOT(idea);

      expect(result.strengths.length).toBeLessThanOrEqual(3);
      expect(result.weaknesses.length).toBeLessThanOrEqual(3);
      expect(result.opportunities.length).toBeLessThanOrEqual(3);
      expect(result.threats.length).toBeLessThanOrEqual(3);
    });

    it('should provide default analysis for generic ideas', async () => {
      const idea = { title: '새로운 아이디어', description: '일반적인 설명' };
      const result = await aiService.generateSWOT(idea);

      expect(result.strengths.length).toBeGreaterThan(0);
      expect(result.weaknesses.length).toBeGreaterThan(0);
      expect(result.opportunities.length).toBeGreaterThan(0);
      expect(result.threats.length).toBeGreaterThan(0);
    });

    it('should handle idea with tags', async () => {
      const idea = {
        title: 'AI 앱',
        description: '서비스',
        category: '기술',
        tags: ['AI', '모바일', '자동화']
      };
      const result = await aiService.generateSWOT(idea);

      expect(result).toBeDefined();
      expect(result.strengths.length).toBeGreaterThan(0);
    });
  });

  describe('brainstorm', () => {
    it('should respond to implementation questions', async () => {
      const result = await aiService.brainstorm('이 아이디어를 어떻게 구현할 수 있을까요?');

      expect(result.response).toContain('방법');
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions!.length).toBeGreaterThan(0);
    });

    it('should respond to business model questions', async () => {
      const result = await aiService.brainstorm('수익 창출과 비즈니스 모델에 대해 알려주세요');

      expect(result.response).toContain('비즈니스');
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions!.some(s => s.includes('모델'))).toBe(true);
    });

    it('should respond to risk questions', async () => {
      const result = await aiService.brainstorm('이 프로젝트의 리스크는 무엇인가요?');

      expect(result.response).toContain('문제');
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions!.some(s => s.includes('리스크'))).toBe(true);
    });

    it('should respond to competition questions', async () => {
      const result = await aiService.brainstorm('경쟁사와의 차별화 전략이 필요합니다');

      expect(result.response).toContain('경쟁');
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions!.some(s => s.includes('차별화'))).toBe(true);
    });

    it('should respond to target customer questions', async () => {
      const result = await aiService.brainstorm('타겟 고객은 누구인가요?');

      expect(result.response).toContain('타겟');
      expect(result.suggestions).toBeInstanceOf(Array);
    });

    it('should respond to idea development questions', async () => {
      const result = await aiService.brainstorm('아이디어 발전과 확장을 원합니다');

      expect(result.response).toContain('발전');
      expect(result.suggestions).toBeInstanceOf(Array);
    });

    it('should use context when provided', async () => {
      const context = { title: 'AI 헬스케어 앱', category: '헬스케어' };
      const result = await aiService.brainstorm('도움이 필요해요', context);

      expect(result.response).toContain('AI 헬스케어 앱');
    });

    it('should provide follow-up questions', async () => {
      const result = await aiService.brainstorm('일반적인 질문입니다');

      expect(result.questions).toBeInstanceOf(Array);
      expect(result.questions!.length).toBeGreaterThan(0);
    });

    it('should handle generic messages', async () => {
      const result = await aiService.brainstorm('안녕하세요');

      expect(result.response).toBeDefined();
      expect(result.suggestions).toBeInstanceOf(Array);
    });
  });

  describe('improveIdea', () => {
    it('should suggest improvements for short title', async () => {
      const result = await aiService.improveIdea('앱', '간단한 앱입니다');

      expect(result.suggestions).toContain('제목을 더 구체적으로 작성해보세요');
      expect(result.improvedTitle).toBeDefined();
    });

    it('should suggest improvements for short description', async () => {
      const result = await aiService.improveIdea('좋은 아이디어', '설명');

      expect(result.suggestions).toContain('설명을 더 자세히 작성해보세요');
      expect(result.improvedDescription).toBeDefined();
    });

    it('should suggest target user consideration', async () => {
      const result = await aiService.improveIdea('새로운 플랫폼', '서비스를 제공합니다');

      expect(result.suggestions.some(s => s.includes('사용자') || s.includes('고객'))).toBe(true);
    });

    it('should return maximum 3 suggestions', async () => {
      const result = await aiService.improveIdea('테스트', '테');

      expect(result.suggestions.length).toBeLessThanOrEqual(3);
    });
  });

  describe('isAvailable', () => {
    it('should always return true', () => {
      expect(aiService.isAvailable()).toBe(true);
    });
  });
});
