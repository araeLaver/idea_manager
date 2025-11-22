import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '../../utils/storage';
import type { IdeaFormData } from '../../types';

describe.skip('Storage Utils', () => {
  beforeEach(() => {
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
    it('should return empty array when no ideas exist', () => {
      const ideas = storage.getIdeas();
      expect(ideas).toEqual([]);
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
      expect(updatedIdea?.description).toBe(mockIdea.description); // 기존 값 유지
    });

    it('should update updatedAt timestamp', () => {
      const createdIdea = storage.createIdea(mockIdea);
      const originalUpdatedAt = createdIdea.updatedAt;
      
      // 시간 차이를 위해 잠시 대기
      setTimeout(() => {
        storage.updateIdea(createdIdea.id, { title: '새 제목' });
        const updatedIdea = storage.getIdea(createdIdea.id);
        
        expect(updatedIdea?.updatedAt).not.toBe(originalUpdatedAt);
      }, 10);
    });
  });

  describe('deleteIdea', () => {
    it('should delete existing idea', () => {
      const idea1 = storage.createIdea(mockIdea);
      const idea2 = storage.createIdea({ ...mockIdea, title: '두 번째' });
      
      storage.deleteIdea(idea1.id);
      
      const ideas = storage.getIdeas();
      expect(ideas).toHaveLength(1);
      expect(ideas[0].id).toBe(idea2.id);
    });

    it('should not throw error when deleting non-existent idea', () => {
      expect(() => storage.deleteIdea('non-existent-id')).not.toThrow();
    });
  });
});