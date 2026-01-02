import { describe, it, expect, beforeEach } from 'vitest';
import { guestStorage } from '../../services/guestStorage';
import type { IdeaFormData } from '../../types';

describe('GuestStorage Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should not be initialized by default', () => {
      expect(guestStorage.isInitialized()).toBe(false);
    });

    it('should initialize with sample data', () => {
      guestStorage.initialize();

      expect(guestStorage.isInitialized()).toBe(true);
      const ideas = guestStorage.getIdeas();
      const memos = guestStorage.getMemos();

      expect(ideas.length).toBe(4);
      expect(memos.length).toBe(1);
    });

    it('should not reinitialize if already initialized', () => {
      guestStorage.initialize();
      const firstIdeas = guestStorage.getIdeas();

      guestStorage.initialize();
      const secondIdeas = guestStorage.getIdeas();

      expect(firstIdeas[0].id).toBe(secondIdeas[0].id);
    });

    it('should clear all data', () => {
      guestStorage.initialize();
      guestStorage.clear();

      expect(guestStorage.isInitialized()).toBe(false);
      expect(guestStorage.getIdeas()).toEqual([]);
      expect(guestStorage.getMemos()).toEqual([]);
    });
  });

  describe('Ideas CRUD', () => {
    const mockIdea: IdeaFormData = {
      title: '테스트 아이디어',
      description: '테스트 설명',
      category: '기술',
      priority: 'high',
      status: 'draft',
      tags: ['테스트', '개발'],
    };

    it('should create a new idea', () => {
      const idea = guestStorage.createIdea(mockIdea);

      expect(idea.id).toBeDefined();
      expect(idea.id.startsWith('guest_')).toBe(true);
      expect(idea.title).toBe(mockIdea.title);
      expect(idea.createdAt).toBeDefined();
      expect(idea.updatedAt).toBeDefined();
    });

    it('should get all ideas', () => {
      guestStorage.createIdea(mockIdea);
      guestStorage.createIdea({ ...mockIdea, title: '두 번째' });

      const ideas = guestStorage.getIdeas();
      expect(ideas).toHaveLength(2);
    });

    it('should get idea by id', () => {
      const created = guestStorage.createIdea(mockIdea);
      const found = guestStorage.getIdea(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
    });

    it('should return null for non-existent idea', () => {
      const found = guestStorage.getIdea('non-existent');
      expect(found).toBeNull();
    });

    it('should update an idea', () => {
      const created = guestStorage.createIdea(mockIdea);
      const updated = guestStorage.updateIdea(created.id, { title: '수정된 제목' });

      expect(updated).not.toBeNull();
      expect(updated?.title).toBe('수정된 제목');
      expect(updated?.description).toBe(mockIdea.description);
    });

    it('should return null when updating non-existent idea', () => {
      const result = guestStorage.updateIdea('non-existent', { title: 'new' });
      expect(result).toBeNull();
    });

    it('should delete an idea', () => {
      const created = guestStorage.createIdea(mockIdea);
      const result = guestStorage.deleteIdea(created.id);

      expect(result).toBe(true);
      expect(guestStorage.getIdea(created.id)).toBeNull();
    });

    it('should return false when deleting non-existent idea', () => {
      const result = guestStorage.deleteIdea('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('Ideas Search and Filter', () => {
    beforeEach(() => {
      guestStorage.createIdea({
        title: 'React 앱',
        description: '웹 애플리케이션',
        category: '기술',
        priority: 'high',
        status: 'in-progress',
        tags: ['react', 'frontend'],
      });
      guestStorage.createIdea({
        title: 'Node 서버',
        description: '백엔드 서버',
        category: '기술',
        priority: 'medium',
        status: 'draft',
        tags: ['node', 'backend'],
      });
      guestStorage.createIdea({
        title: '마케팅 전략',
        description: '신제품 마케팅',
        category: '비즈니스',
        priority: 'low',
        status: 'completed',
        tags: ['marketing'],
      });
    });

    it('should search by title', () => {
      const results = guestStorage.searchIdeas('React');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('React 앱');
    });

    it('should search by description', () => {
      const results = guestStorage.searchIdeas('백엔드');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Node 서버');
    });

    it('should search by category', () => {
      const results = guestStorage.searchIdeas('비즈니스');
      expect(results).toHaveLength(1);
    });

    it('should search by tag', () => {
      const results = guestStorage.searchIdeas('frontend');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('React 앱');
    });

    it('should be case insensitive', () => {
      const results = guestStorage.searchIdeas('REACT');
      expect(results).toHaveLength(1);
    });

    it('should filter by status', () => {
      const results = guestStorage.filterIdeas({ status: 'draft' });
      expect(results).toHaveLength(1);
      expect(results[0].status).toBe('draft');
    });

    it('should filter by category', () => {
      const results = guestStorage.filterIdeas({ category: '기술' });
      expect(results).toHaveLength(2);
    });

    it('should filter by priority', () => {
      const results = guestStorage.filterIdeas({ priority: 'high' });
      expect(results).toHaveLength(1);
    });

    it('should combine multiple filters', () => {
      const results = guestStorage.filterIdeas({
        category: '기술',
        status: 'in-progress'
      });
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('React 앱');
    });
  });

  describe('Stats', () => {
    beforeEach(() => {
      guestStorage.createIdea({
        title: 'Idea 1',
        description: 'Desc',
        category: '기술',
        priority: 'high',
        status: 'completed',
        tags: ['tag1', 'tag2'],
      });
      guestStorage.createIdea({
        title: 'Idea 2',
        description: 'Desc',
        category: '기술',
        priority: 'medium',
        status: 'in-progress',
        tags: ['tag1'],
      });
      guestStorage.createIdea({
        title: 'Idea 3',
        description: 'Desc',
        category: '비즈니스',
        priority: 'low',
        status: 'draft',
        tags: ['tag3'],
      });
    });

    it('should calculate correct stats', () => {
      const stats = guestStorage.getStats();

      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(1);
      expect(stats.inProgress).toBe(1);
      expect(stats.draft).toBe(1);
      expect(stats.archived).toBe(0);
      expect(stats.highPriority).toBe(1);
      expect(stats.completionRate).toBe(33);
    });

    it('should calculate top categories', () => {
      const stats = guestStorage.getStats();

      expect(stats.topCategories).toHaveLength(2);
      expect(stats.topCategories[0].category).toBe('기술');
      expect(stats.topCategories[0].count).toBe(2);
    });

    it('should calculate top tags', () => {
      const stats = guestStorage.getStats();

      expect(stats.topTags.length).toBeGreaterThan(0);
      expect(stats.topTags[0].tag).toBe('tag1');
      expect(stats.topTags[0].count).toBe(2);
    });

    it('should return zero stats when no ideas', () => {
      localStorage.clear();
      const stats = guestStorage.getStats();

      expect(stats.total).toBe(0);
      expect(stats.completionRate).toBe(0);
    });
  });

  describe('Memos', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    it('should save a new memo', () => {
      const memo = guestStorage.saveMemo(today, '오늘의 메모');

      expect(memo.id).toBeDefined();
      expect(memo.date).toBe(today);
      expect(memo.content).toBe('오늘의 메모');
    });

    it('should update existing memo', () => {
      guestStorage.saveMemo(today, '원본');
      const updated = guestStorage.saveMemo(today, '수정됨');

      expect(updated.content).toBe('수정됨');
      expect(guestStorage.getMemos()).toHaveLength(1);
    });

    it('should get memo by date', () => {
      guestStorage.saveMemo(today, '오늘 메모');
      guestStorage.saveMemo(yesterday, '어제 메모');

      const memo = guestStorage.getMemoByDate(today);
      expect(memo?.content).toBe('오늘 메모');
    });

    it('should return null for non-existent date', () => {
      const memo = guestStorage.getMemoByDate('2020-01-01');
      expect(memo).toBeNull();
    });

    it('should get memos by month', () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      guestStorage.saveMemo(today, '메모 1');
      guestStorage.saveMemo(yesterday, '메모 2');

      const memos = guestStorage.getMemosByMonth(month, year);
      expect(memos.length).toBeGreaterThanOrEqual(1);
    });

    it('should delete memo by date', () => {
      guestStorage.saveMemo(today, '삭제할 메모');

      const result = guestStorage.deleteMemoByDate(today);
      expect(result).toBe(true);
      expect(guestStorage.getMemoByDate(today)).toBeNull();
    });

    it('should return false when deleting non-existent memo', () => {
      const result = guestStorage.deleteMemoByDate('2020-01-01');
      expect(result).toBe(false);
    });
  });
});
