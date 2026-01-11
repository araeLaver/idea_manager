/**
 * Guest Mode Local Storage Service
 * Provides offline data management for non-authenticated users
 */

import type { Idea, IdeaFormData, Stats, DailyMemo } from '../types';

const STORAGE_KEYS = {
  IDEAS: 'guest_ideas',
  MEMOS: 'guest_memos',
  INITIALIZED: 'guest_initialized',
};

/** Generate a unique ID for guest data */
const generateId = (): string => {
  return `guest_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
};

/** Helper to get a future date string */
const getFutureDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

/** Sample ideas for new guest users */
const SAMPLE_IDEAS: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: '모바일 습관 추적 앱',
    description: '사용자의 일상 습관을 추적하고 시각화하여 좋은 습관을 형성할 수 있도록 도와주는 앱입니다. 게이미피케이션 요소를 추가하여 동기부여를 높입니다.',
    category: '모바일앱',
    tags: ['습관', '생산성', '게이미피케이션', 'iOS', 'Android'],
    status: 'in-progress',
    priority: 'high',
    notes: '주요 경쟁 앱: Habitica, Streaks, Loop\n차별점: AI 기반 개인화된 습관 추천',
    targetMarket: '20-40대 직장인, 자기계발에 관심 있는 사용자',
    potentialRevenue: '프리미엄 구독 모델, 월 $4.99',
    resources: '모바일 개발자 2명, UI/UX 디자이너 1명, 백엔드 개발자 1명',
    timeline: '개발 3개월, 베타 테스트 1개월',
    deadline: getFutureDate(7),
    reminderEnabled: true,
    reminderDays: 3,
  },
  {
    title: '로컬 맛집 큐레이션 플랫폼',
    description: '지역 주민들이 직접 추천하는 숨은 맛집을 발굴하고 공유하는 플랫폼입니다. 관광객보다는 현지인 취향에 맞는 진짜 맛집을 찾을 수 있습니다.',
    category: '웹서비스',
    tags: ['음식', '지역', '커뮤니티', '추천시스템'],
    status: 'draft',
    priority: 'medium',
    notes: '초기 지역: 서울 성수동, 연남동 등 핫플레이스 중심\n수익모델: 식당 프로모션, 프리미엄 리스팅',
    targetMarket: '음식에 관심 많은 2030 세대',
    potentialRevenue: '광고 및 프로모션 수익',
    resources: '풀스택 개발자 1명, 콘텐츠 에디터 2명',
    timeline: '',
    deadline: getFutureDate(14),
    reminderEnabled: true,
    reminderDays: 5,
  },
  {
    title: 'AI 기반 학습 도우미',
    description: '학생들의 학습 패턴을 분석하여 개인화된 학습 계획과 문제를 추천하는 AI 튜터입니다. 약점 분석과 복습 스케줄링 기능을 제공합니다.',
    category: '에듀테크',
    tags: ['AI', '교육', '학습', '개인화'],
    status: 'completed',
    priority: 'high',
    notes: 'GPT API 활용, 과목별 전문 프롬프트 설계 필요',
    targetMarket: '중고등학생, 수험생, 자기주도 학습자',
    potentialRevenue: 'B2C 구독 + B2B 학원/학교 라이선스',
    resources: 'AI/ML 엔지니어, 교육 콘텐츠 전문가',
    timeline: 'MVP 2개월, 정식 런칭 4개월',
  },
  {
    title: '친환경 포장재 마켓플레이스',
    description: '친환경 포장재를 필요로 하는 소상공인과 제조업체를 연결하는 B2B 마켓플레이스입니다. 탄소발자국 계산 및 인증 서비스도 제공합니다.',
    category: '환경',
    tags: ['친환경', 'B2B', '마켓플레이스', 'ESG'],
    status: 'draft',
    priority: 'low',
    notes: '정부 친환경 정책과 연계 가능성 검토',
    targetMarket: '친환경 전환을 원하는 중소기업',
    potentialRevenue: '거래 수수료 3-5%',
    resources: '',
    timeline: '',
  },
];

/** Sample memos for new guest users */
const SAMPLE_MEMOS: Omit<DailyMemo, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    date: new Date().toISOString().split('T')[0],
    content: '# 오늘의 아이디어\n\n- 게스트 모드로 Idea Manager를 체험 중입니다.\n- 이 메모는 샘플 데이터입니다.\n- 자유롭게 수정하거나 삭제할 수 있습니다!\n\n## 다음 단계\n1. 아이디어 목록 확인하기\n2. 칸반 보드에서 드래그 앤 드롭 해보기\n3. 새로운 아이디어 추가해보기',
  },
];

/**
 * Guest Storage Service for managing offline data
 */
export const guestStorage = {
  /** Check if guest data has been initialized */
  isInitialized(): boolean {
    return localStorage.getItem(STORAGE_KEYS.INITIALIZED) === 'true';
  },

  /** Initialize guest data with sample content */
  initialize(): void {
    if (this.isInitialized()) return;

    const now = new Date().toISOString();
    const ideas: Idea[] = SAMPLE_IDEAS.map((idea, index) => ({
      ...idea,
      id: generateId(),
      createdAt: new Date(Date.now() - index * 86400000).toISOString(), // Stagger creation dates
      updatedAt: now,
    }));

    const memos: DailyMemo[] = SAMPLE_MEMOS.map((memo) => ({
      ...memo,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }));

    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
    localStorage.setItem(STORAGE_KEYS.MEMOS, JSON.stringify(memos));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  },

  /** Clear all guest data */
  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.IDEAS);
    localStorage.removeItem(STORAGE_KEYS.MEMOS);
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
  },

  // ============ Ideas ============

  /** Get all guest ideas */
  getIdeas(): Idea[] {
    const data = localStorage.getItem(STORAGE_KEYS.IDEAS);
    return data ? JSON.parse(data) : [];
  },

  /** Get a single idea by ID */
  getIdea(id: string): Idea | null {
    const ideas = this.getIdeas();
    return ideas.find((idea) => idea.id === id) || null;
  },

  /** Create a new idea */
  createIdea(data: IdeaFormData): Idea {
    const ideas = this.getIdeas();
    const now = new Date().toISOString();
    const newIdea: Idea = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    ideas.unshift(newIdea);
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
    return newIdea;
  },

  /** Update an existing idea */
  updateIdea(id: string, data: Partial<IdeaFormData>): Idea | null {
    const ideas = this.getIdeas();
    const index = ideas.findIndex((idea) => idea.id === id);
    if (index === -1) return null;

    ideas[index] = {
      ...ideas[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
    return ideas[index];
  },

  /** Delete an idea */
  deleteIdea(id: string): boolean {
    const ideas = this.getIdeas();
    const filtered = ideas.filter((idea) => idea.id !== id);
    if (filtered.length === ideas.length) return false;
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(filtered));
    return true;
  },

  /** Search ideas by query */
  searchIdeas(query: string): Idea[] {
    const ideas = this.getIdeas();
    const lowerQuery = query.toLowerCase();
    return ideas.filter(
      (idea) =>
        idea.title.toLowerCase().includes(lowerQuery) ||
        idea.description.toLowerCase().includes(lowerQuery) ||
        idea.category.toLowerCase().includes(lowerQuery) ||
        idea.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  },

  /** Filter ideas by criteria */
  filterIdeas(filters: { status?: string; category?: string; priority?: string }): Idea[] {
    let ideas = this.getIdeas();
    if (filters.status) {
      ideas = ideas.filter((idea) => idea.status === filters.status);
    }
    if (filters.category) {
      ideas = ideas.filter((idea) => idea.category === filters.category);
    }
    if (filters.priority) {
      ideas = ideas.filter((idea) => idea.priority === filters.priority);
    }
    return ideas;
  },

  /** Get stats for guest ideas */
  getStats(): Stats {
    const ideas = this.getIdeas();
    const completed = ideas.filter((i) => i.status === 'completed').length;
    const total = ideas.length;

    // Calculate top categories
    const categoryCount: Record<string, number> = {};
    ideas.forEach((idea) => {
      categoryCount[idea.category] = (categoryCount[idea.category] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate top tags
    const tagCount: Record<string, number> = {};
    ideas.forEach((idea) => {
      idea.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    const topTags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total,
      completed,
      inProgress: ideas.filter((i) => i.status === 'in-progress').length,
      draft: ideas.filter((i) => i.status === 'draft').length,
      archived: ideas.filter((i) => i.status === 'archived').length,
      highPriority: ideas.filter((i) => i.priority === 'high').length,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      topCategories,
      topTags,
    };
  },

  // ============ Memos ============

  /** Get all memos */
  getMemos(): DailyMemo[] {
    const data = localStorage.getItem(STORAGE_KEYS.MEMOS);
    return data ? JSON.parse(data) : [];
  },

  /** Get memos for a specific month */
  getMemosByMonth(month: number, year: number): DailyMemo[] {
    const memos = this.getMemos();
    return memos.filter((memo) => {
      const date = new Date(memo.date);
      return date.getMonth() + 1 === month && date.getFullYear() === year;
    });
  },

  /** Get memo by date */
  getMemoByDate(date: string): DailyMemo | null {
    const memos = this.getMemos();
    return memos.find((memo) => memo.date === date) || null;
  },

  /** Save or update a memo */
  saveMemo(date: string, content: string): DailyMemo {
    const memos = this.getMemos();
    const now = new Date().toISOString();
    const existingIndex = memos.findIndex((memo) => memo.date === date);

    if (existingIndex !== -1) {
      memos[existingIndex] = {
        ...memos[existingIndex],
        content,
        updatedAt: now,
      };
      localStorage.setItem(STORAGE_KEYS.MEMOS, JSON.stringify(memos));
      return memos[existingIndex];
    } else {
      const newMemo: DailyMemo = {
        id: generateId(),
        date,
        content,
        createdAt: now,
        updatedAt: now,
      };
      memos.push(newMemo);
      localStorage.setItem(STORAGE_KEYS.MEMOS, JSON.stringify(memos));
      return newMemo;
    }
  },

  /** Delete memo by date */
  deleteMemoByDate(date: string): boolean {
    const memos = this.getMemos();
    const filtered = memos.filter((memo) => memo.date !== date);
    if (filtered.length === memos.length) return false;
    localStorage.setItem(STORAGE_KEYS.MEMOS, JSON.stringify(filtered));
    return true;
  },
};

export default guestStorage;
