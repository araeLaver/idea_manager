import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Idea, IdeaFormData } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface Stats {
  total: number;
  completed: number;
  inProgress: number;
  draft: number;
  archived: number;
  highPriority: number;
  completionRate: number;
  topCategories: { category: string; count: number }[];
  topTags: { tag: string; count: number }[];
}

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
  const { isAuthenticated } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  const refreshIdeas = async () => {
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
      console.error('Error fetching ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    if (!isAuthenticated) {
      setStats(null);
      return;
    }

    try {
      const fetchedStats = await api.getStats();
      setStats(fetchedStats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const createIdea = async (ideaData: IdeaFormData): Promise<Idea> => {
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
    try {
      return await api.getIdea(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get idea');
      return null;
    }
  };

  const searchIdeas = async (query: string): Promise<Idea[]> => {
    try {
      return await api.getAllIdeas({ search: query });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search ideas');
      return [];
    }
  };

  const filterIdeas = async (filters: { status?: string; category?: string; priority?: string }): Promise<Idea[]> => {
    try {
      return await api.getAllIdeas(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter ideas');
      return [];
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshIdeas();
      refreshStats();
    } else {
      setIdeas([]);
      setStats(null);
    }
  }, [isAuthenticated]);

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
