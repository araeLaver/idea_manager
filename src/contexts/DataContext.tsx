import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Idea, IdeaFormData, Stats } from '../types';
import api from '../services/api';
import { guestStorage } from '../services/guestStorage';
import { useAuth } from './AuthContext';

interface DataContextType {
  ideas: Idea[];
  loading: boolean;
  error: string | null;
  stats: Stats | null;
  createIdea: (idea: IdeaFormData) => Promise<Idea>;
  updateIdea: (id: string, idea: Partial<IdeaFormData>) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;
  getIdea: (id: string) => Promise<Idea | null>;
  searchIdeas: (query: string) => Promise<Idea[]>;
  refreshIdeas: () => Promise<void>;
  refreshStats: () => Promise<void>;
  filterIdeas: (filters: { status?: string; category?: string; priority?: string }) => Promise<Idea[]>;
  bulkUpdateStatus: (ids: string[], status: Idea['status']) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isGuest } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  // Initialize guest data when entering guest mode
  useEffect(() => {
    if (isGuest && !guestStorage.isInitialized()) {
      guestStorage.initialize();
    }
  }, [isGuest]);

  const refreshIdeas = useCallback(async () => {
    // Handle guest mode
    if (isGuest) {
      setLoading(true);
      try {
        const guestIdeas = guestStorage.getIdeas();
        setIdeas(guestIdeas);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Handle authenticated mode
    if (!isAuthenticated) {
      setIdeas([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fetchedIdeas = await api.getAllIdeas();
      setIdeas(fetchedIdeas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ideas');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isGuest]);

  const refreshStats = useCallback(async () => {
    // Handle guest mode
    if (isGuest) {
      const guestStats = guestStorage.getStats();
      setStats(guestStats);
      return;
    }

    // Handle authenticated mode
    if (!isAuthenticated) {
      setStats(null);
      return;
    }

    try {
      const fetchedStats = await api.getStats();
      setStats(fetchedStats);
    } catch (error) {
      // Stats fetch is non-critical, log for debugging in development only
      if (import.meta.env.DEV) {
        console.debug('Stats fetch failed:', error);
      }
    }
  }, [isAuthenticated, isGuest]);

  const createIdea = useCallback(async (ideaData: IdeaFormData): Promise<Idea> => {
    // Handle guest mode
    if (isGuest) {
      const newIdea = guestStorage.createIdea(ideaData);
      await Promise.all([refreshIdeas(), refreshStats()]);
      return newIdea;
    }

    // Handle authenticated mode
    try {
      const newIdea = await api.createIdea(ideaData);
      await Promise.all([refreshIdeas(), refreshStats()]);
      return newIdea;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create idea');
      throw err;
    }
  }, [isGuest, refreshIdeas, refreshStats]);

  const updateIdea = useCallback(async (id: string, ideaData: Partial<IdeaFormData>): Promise<void> => {
    // Handle guest mode
    if (isGuest) {
      const updated = guestStorage.updateIdea(id, ideaData);
      if (!updated) throw new Error('Idea not found');
      await Promise.all([refreshIdeas(), refreshStats()]);
      return;
    }

    // Handle authenticated mode with optimistic update
    const previousIdeas = [...ideas];

    // Optimistically update UI immediately
    setIdeas(prevIdeas =>
      prevIdeas.map(idea =>
        idea.id === id ? { ...idea, ...ideaData, updatedAt: new Date().toISOString() } : idea
      )
    );

    try {
      const updatedIdea = await api.updateIdea(id, ideaData);
      // Update with server response instead of refetching all ideas
      setIdeas(prevIdeas =>
        prevIdeas.map(idea => idea.id === id ? updatedIdea : idea)
      );
      await refreshStats();
    } catch (err) {
      // Rollback on error
      setIdeas(previousIdeas);
      setError(err instanceof Error ? err.message : 'Failed to update idea');
      throw err;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refreshIdeas omitted for optimistic update
  }, [isGuest, ideas, refreshStats]);

  const deleteIdea = useCallback(async (id: string): Promise<void> => {
    // Handle guest mode
    if (isGuest) {
      const deleted = guestStorage.deleteIdea(id);
      if (!deleted) throw new Error('Idea not found');
      await Promise.all([refreshIdeas(), refreshStats()]);
      return;
    }

    // Handle authenticated mode with optimistic delete
    const previousIdeas = [...ideas];

    // Optimistically remove from UI immediately
    setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== id));

    try {
      await api.deleteIdea(id);
      // Optimistic delete is sufficient, just refresh stats
      await refreshStats();
    } catch (err) {
      // Rollback on error
      setIdeas(previousIdeas);
      setError(err instanceof Error ? err.message : 'Failed to delete idea');
      throw err;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refreshIdeas omitted for optimistic delete
  }, [isGuest, ideas, refreshStats]);

  const getIdea = useCallback(async (id: string): Promise<Idea | null> => {
    // Handle guest mode
    if (isGuest) {
      return guestStorage.getIdea(id);
    }

    // Handle authenticated mode
    try {
      return await api.getIdea(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get idea');
      return null;
    }
  }, [isGuest]);

  const searchIdeas = useCallback(async (query: string): Promise<Idea[]> => {
    // Handle guest mode
    if (isGuest) {
      return guestStorage.searchIdeas(query);
    }

    // Handle authenticated mode
    try {
      return await api.getAllIdeas({ search: query });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search ideas');
      return [];
    }
  }, [isGuest]);

  const filterIdeas = useCallback(async (filters: { status?: string; category?: string; priority?: string }): Promise<Idea[]> => {
    // Handle guest mode
    if (isGuest) {
      return guestStorage.filterIdeas(filters);
    }

    // Handle authenticated mode
    try {
      return await api.getAllIdeas(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter ideas');
      return [];
    }
  }, [isGuest]);

  const bulkUpdateStatus = useCallback(async (ids: string[], status: Idea['status']): Promise<void> => {
    // Handle guest mode - update each idea individually
    if (isGuest) {
      for (const id of ids) {
        guestStorage.updateIdea(id, { status });
      }
      await Promise.all([refreshIdeas(), refreshStats()]);
      return;
    }

    // Handle authenticated mode with optimistic update
    const previousIdeas = [...ideas];
    const idsSet = new Set(ids);

    // Optimistically update statuses immediately
    setIdeas(prevIdeas =>
      prevIdeas.map(idea =>
        idsSet.has(idea.id) ? { ...idea, status, updatedAt: new Date().toISOString() } : idea
      )
    );

    try {
      await api.bulkUpdateStatus(ids, status);
      // Optimistic update is sufficient, just refresh stats
      await refreshStats();
    } catch (err) {
      // Rollback on error
      setIdeas(previousIdeas);
      setError(err instanceof Error ? err.message : 'Failed to bulk update status');
      throw err;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refreshIdeas omitted for optimistic bulk update
  }, [isGuest, ideas, refreshStats]);

  useEffect(() => {
    if (isAuthenticated || isGuest) {
      refreshIdeas();
      refreshStats();
    } else {
      setIdeas([]);
      setStats(null);
    }
  }, [isAuthenticated, isGuest, refreshIdeas, refreshStats]);

  const value = useMemo<DataContextType>(() => ({
    ideas,
    loading,
    error,
    stats,
    createIdea,
    updateIdea,
    deleteIdea,
    getIdea,
    searchIdeas,
    refreshIdeas,
    refreshStats,
    filterIdeas,
    bulkUpdateStatus,
  }), [
    ideas,
    loading,
    error,
    stats,
    createIdea,
    updateIdea,
    deleteIdea,
    getIdea,
    searchIdeas,
    refreshIdeas,
    refreshStats,
    filterIdeas,
    bulkUpdateStatus,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
