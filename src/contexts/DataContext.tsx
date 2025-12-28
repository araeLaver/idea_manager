import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
    } catch {
      // Stats fetch failed silently - non-critical
    }
  }, [isAuthenticated, isGuest]);

  const createIdea = async (ideaData: IdeaFormData): Promise<Idea> => {
    // Handle guest mode
    if (isGuest) {
      const newIdea = guestStorage.createIdea(ideaData);
      await refreshIdeas();
      await refreshStats();
      return newIdea;
    }

    // Handle authenticated mode
    try {
      const newIdea = await api.createIdea(ideaData);
      await refreshIdeas();
      await refreshStats();
      return newIdea;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create idea');
      throw err;
    }
  };

  const updateIdea = async (id: string, ideaData: Partial<IdeaFormData>): Promise<void> => {
    // Handle guest mode
    if (isGuest) {
      const updated = guestStorage.updateIdea(id, ideaData);
      if (!updated) throw new Error('Idea not found');
      await refreshIdeas();
      await refreshStats();
      return;
    }

    // Handle authenticated mode
    try {
      await api.updateIdea(id, ideaData);
      await refreshIdeas();
      await refreshStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update idea');
      throw err;
    }
  };

  const deleteIdea = async (id: string): Promise<void> => {
    // Handle guest mode
    if (isGuest) {
      const deleted = guestStorage.deleteIdea(id);
      if (!deleted) throw new Error('Idea not found');
      await refreshIdeas();
      await refreshStats();
      return;
    }

    // Handle authenticated mode
    try {
      await api.deleteIdea(id);
      await refreshIdeas();
      await refreshStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete idea');
      throw err;
    }
  };

  const getIdea = async (id: string): Promise<Idea | null> => {
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
  };

  const searchIdeas = async (query: string): Promise<Idea[]> => {
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
  };

  const filterIdeas = async (filters: { status?: string; category?: string; priority?: string }): Promise<Idea[]> => {
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
  };

  useEffect(() => {
    if (isAuthenticated || isGuest) {
      refreshIdeas();
      refreshStats();
    } else {
      setIdeas([]);
      setStats(null);
    }
  }, [isAuthenticated, isGuest, refreshIdeas, refreshStats]);

  const value: DataContextType = {
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
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
