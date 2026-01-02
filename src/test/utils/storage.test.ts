import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { storage } from '../../utils/storage';
import type { IdeaFormData } from '../../types';

describe('Storage Utils', () => {
  beforeEach(() => {
    localStorage.clear();
    // 샘플 데이터 생성 방지를 위해 빈 배열로 초기화
    storage.saveIdeas([]);
  });

  afterEach(() => {
    localStorage.clear();
  });

  const mockIdea: IdeaFormData = {
    title: '테스트 아이디어',
    description: '테스트 설명',
    category: '기술',
    priority: 'high',
    status: 'draft',
    tags: ['테스트', '개발'],
  };

  describe('createIdea', () => {
    it('should create a new idea', () => {
      const idea = storage.createIdea(mockIdea);

      expect(idea.id).toBeDefined();
      expect(idea.title).toBe(mockIdea.title);
      expect(idea.description).toBe(mockIdea.description);
      expect(idea.category).toBe(mockIdea.category);
      expect(idea.priority).toBe(mockIdea.priority);
      expect(idea.status).toBe(mockIdea.status);
      expect(idea.tags).toEqual(mockIdea.tags);
      expect(idea.createdAt).toBeDefined();
      expect(idea.updatedAt).toBeDefined();
    });

    it('should save idea to localStorage', () => {
      const idea = storage.createIdea(mockIdea);
      const storedIdeas = JSON.parse(localStorage.getItem('ideas') || '[]');

      expect(storedIdeas).toHaveLength(1);
      expect(storedIdeas[0].id).toBe(idea.id);
    });
  });

  describe('getIdeas', () => {
    it('should return sample ideas on first call when no data exists', () => {
      localStorage.clear(); // 빈 배열 초기화 제거
      const ideas = storage.getIdeas();
      // 첫 호출 시 샘플 데이터가 생성됨
      expect(ideas.length).toBeGreaterThan(0);
    });

    it('should return all stored ideas', () => {
      const idea1 = storage.createIdea(mockIdea);
      const idea2 = storage.createIdea({ ...mockIdea, title: '두 번째 아이디어' });

      const ideas = storage.getIdeas();
      expect(ideas).toHaveLength(2);
      expect(ideas.map(i => i.id)).toContain(idea1.id);
      expect(ideas.map(i => i.id)).toContain(idea2.id);
    });
  });

  describe('getIdea', () => {
    it('should return null for non-existent idea', () => {
      const idea = storage.getIdea('non-existent-id');
      expect(idea).toBeNull();
    });

    it('should return idea by id', () => {
      const createdIdea = storage.createIdea(mockIdea);
      const foundIdea = storage.getIdea(createdIdea.id);

      expect(foundIdea).not.toBeNull();
      expect(foundIdea?.id).toBe(createdIdea.id);
      expect(foundIdea?.title).toBe(mockIdea.title);
    });
  });

  describe('updateIdea', () => {
    it('should update existing idea', () => {
      const createdIdea = storage.createIdea(mockIdea);
      const updates = { title: '업데이트된 제목', status: 'completed' as const };

      storage.updateIdea(createdIdea.id, updates);
      const updatedIdea = storage.getIdea(createdIdea.id);

      expect(updatedIdea?.title).toBe(updates.title);
      expect(updatedIdea?.status).toBe(updates.status);
      expect(updatedIdea?.description).toBe(mockIdea.description);
    });

    it('should update updatedAt timestamp', async () => {
      const createdIdea = storage.createIdea(mockIdea);
      const originalUpdatedAt = createdIdea.updatedAt;

      // 시간 차이를 위해 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 10));

      storage.updateIdea(createdIdea.id, { title: '새 제목' });
      const updatedIdea = storage.getIdea(createdIdea.id);

      expect(updatedIdea?.updatedAt).not.toBe(originalUpdatedAt);
    });
  });

  describe('deleteIdea', () => {
    it('should delete existing idea', () => {
      // 독립적인 테스트를 위해 localStorage를 직접 조작
      const testIdea1 = {
        id: 'test-id-1',
        title: '첫 번째',
        description: '설명',
        category: '기술',
        priority: 'high' as const,
        status: 'draft' as const,
        tags: ['테스트'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const testIdea2 = {
        id: 'test-id-2',
        title: '두 번째',
        description: '설명',
        category: '기술',
        priority: 'high' as const,
        status: 'draft' as const,
        tags: ['테스트'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 직접 저장
      storage.saveIdeas([testIdea1, testIdea2]);

      // 생성 확인
      expect(storage.getIdeas()).toHaveLength(2);

      // 삭제
      storage.deleteIdea('test-id-1');

      // 결과 확인
      const ideas = storage.getIdeas();
      expect(ideas).toHaveLength(1);
      expect(ideas[0].id).toBe('test-id-2');
    });

    it('should not throw error when deleting non-existent idea', () => {
      expect(() => storage.deleteIdea('non-existent-id')).not.toThrow();
    });
  });
});
