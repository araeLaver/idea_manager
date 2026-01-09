import type {
  Idea,
  IdeaFormData,
  User,
  AuthResponse,
  PaginatedResponse,
  DataResponse,
  DailyMemo,
  IdeaHistory,
  Stats,
  IdeaFilters,
  MessageResponse,
  PasswordResetVerifyResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

// Maximum items to fetch when getting "all" ideas (with pagination support)
const MAX_ITEMS_PER_PAGE = 100;
const DEFAULT_PAGE_SIZE = 50;

/**
 * Custom error class for API errors with status code and auth error detection
 */
export class ApiError extends Error {
  /** HTTP status code of the error response */
  status: number;
  /** Whether this error indicates an authentication failure (expired/invalid token) */
  isAuthError: boolean;

  constructor(message: string, status: number, isAuthError: boolean = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isAuthError = isAuthError;
  }
}

// Token expiration detection
const isTokenExpiredError = (status: number, message: string): boolean => {
  return status === 401 && (
    message.toLowerCase().includes('expired') ||
    message.toLowerCase().includes('invalid') ||
    message.toLowerCase().includes('revoked')
  );
};

/**
 * API service for communicating with the backend server.
 * Handles authentication, ideas, memos, and history operations.
 */
class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  /** Set or clear the authentication token */
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  /** Get the current authentication token */
  getToken() {
    return this.token;
  }

  /**
   * Make an authenticated API request
   * @throws {ApiError} When the request fails
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      const errorMessage = errorData.error || 'Request failed';
      const isAuthError = isTokenExpiredError(response.status, errorMessage);

      // Clear token if it's an auth error
      if (isAuthError) {
        this.setToken(null);
      }

      throw new ApiError(errorMessage, response.status, isAuthError);
    }

    return response.json();
  }

  /** Register a new user account */
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(data.token);
    return data;
  }

  /** Login with email and password */
  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  /** Logout and invalidate the current token */
  async logout(): Promise<void> {
    try {
      // Invalidate token on server
      if (this.token) {
        await this.request<MessageResponse>('/auth/logout', {
          method: 'POST',
        });
      }
    } catch {
      // Continue with local logout even if server request fails
      if (import.meta.env.DEV) {
        console.warn('Server logout failed, continuing with local logout');
      }
    } finally {
      this.setToken(null);
    }
  }

  /** Request a password reset email */
  async requestPasswordReset(email: string): Promise<MessageResponse> {
    return this.request<MessageResponse>('/auth/password-reset/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /** Verify if a password reset token is valid */
  async verifyPasswordResetToken(token: string): Promise<PasswordResetVerifyResponse> {
    return this.request<PasswordResetVerifyResponse>('/auth/password-reset/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  /** Complete password reset with new password */
  async confirmPasswordReset(token: string, newPassword: string): Promise<MessageResponse> {
    return this.request<MessageResponse>('/auth/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  /** Get the currently authenticated user's profile */
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  /** Update the current user's profile */
  async updateProfile(data: { name?: string; email?: string }): Promise<User> {
    return this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /** Change the current user's password */
  async changePassword(currentPassword: string, newPassword: string): Promise<MessageResponse> {
    return this.request<MessageResponse>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  /** Get ideas with optional filters and pagination */
  async getIdeas(filters?: IdeaFilters): Promise<PaginatedResponse<Idea>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return this.request<PaginatedResponse<Idea>>(`/ideas${query ? `?${query}` : ''}`);
  }

  /** Get all ideas with automatic pagination (fetches all pages) */
  async getAllIdeas(filters?: Omit<IdeaFilters, 'page' | 'limit'>): Promise<Idea[]> {
    const allIdeas: Idea[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      params.append('page', String(page));
      params.append('limit', String(MAX_ITEMS_PER_PAGE));

      const query = params.toString();
      const result = await this.request<PaginatedResponse<Idea>>(`/ideas?${query}`);

      allIdeas.push(...result.data);
      hasMore = result.pagination.hasNext;
      page++;

      // Safety limit to prevent infinite loops
      if (page > 100) {
        if (import.meta.env.DEV) {
          console.warn('getAllIdeas: Reached maximum page limit');
        }
        break;
      }
    }

    return allIdeas;
  }

  /** Get a single idea by ID */
  async getIdea(id: string): Promise<Idea> {
    return this.request<Idea>(`/ideas/${id}`);
  }

  /** Create a new idea */
  async createIdea(data: IdeaFormData): Promise<Idea> {
    return this.request<Idea>('/ideas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /** Update an existing idea */
  async updateIdea(id: string, data: Partial<IdeaFormData>): Promise<Idea> {
    return this.request<Idea>(`/ideas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /** Delete an idea by ID */
  async deleteIdea(id: string): Promise<MessageResponse> {
    return this.request<MessageResponse>(`/ideas/${id}`, {
      method: 'DELETE',
    });
  }

  /** Get idea statistics summary */
  async getStats(): Promise<Stats> {
    return this.request<Stats>('/ideas/stats/summary');
  }

  /** Bulk update status for multiple ideas */
  async bulkUpdateStatus(ids: string[], status: string): Promise<MessageResponse> {
    return this.request<MessageResponse>('/ideas/bulk/status', {
      method: 'PATCH',
      body: JSON.stringify({ ids, status }),
    });
  }

  /** Get memos, optionally filtered by month and year */
  async getMemos(month?: number, year?: number): Promise<DailyMemo[]> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    const query = params.toString();
    const response = await this.request<DataResponse<DailyMemo[]>>(`/memos${query ? `?${query}` : ''}`);
    return response.data;
  }

  /** Get a memo by specific date (YYYY-MM-DD format) */
  async getMemoByDate(date: string): Promise<DailyMemo | null> {
    return this.request<DailyMemo | null>(`/memos/date/${date}`);
  }

  /** Save or update a memo for a specific date */
  async saveMemo(date: string, content: string): Promise<DailyMemo> {
    return this.request<DailyMemo>('/memos', {
      method: 'POST',
      body: JSON.stringify({ date, content }),
    });
  }

  /** Delete a memo by ID */
  async deleteMemo(id: string): Promise<MessageResponse> {
    return this.request<MessageResponse>(`/memos/${id}`, {
      method: 'DELETE',
    });
  }

  /** Delete a memo by date */
  async deleteMemoByDate(date: string): Promise<MessageResponse> {
    return this.request<MessageResponse>(`/memos/date/${date}`, {
      method: 'DELETE',
    });
  }

  /** Get idea change history with pagination */
  async getHistory(limit: number = DEFAULT_PAGE_SIZE, offset: number = 0): Promise<IdeaHistory[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    const query = params.toString();
    const response = await this.request<DataResponse<IdeaHistory[]>>(`/history?${query}`);
    return response.data;
  }

  /** Get change history for a specific idea */
  async getIdeaHistory(ideaId: string): Promise<IdeaHistory[]> {
    const response = await this.request<DataResponse<IdeaHistory[]>>(`/history/idea/${ideaId}`);
    return response.data;
  }

  /** Get recent activity across all ideas */
  async getRecentActivity(): Promise<IdeaHistory[]> {
    const response = await this.request<DataResponse<IdeaHistory[]>>('/history/recent');
    return response.data;
  }

  /** Migrate guest data (ideas and memos) to the authenticated user's account */
  async migrateGuestData(ideas: IdeaFormData[], memos: { date: string; content: string }[]): Promise<{ ideas: number; memos: number }> {
    const results = { ideas: 0, memos: 0 };

    // Migrate ideas
    for (const idea of ideas) {
      try {
        await this.createIdea(idea);
        results.ideas++;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Failed to migrate idea:', idea.title, error);
        }
      }
    }

    // Migrate memos
    for (const memo of memos) {
      try {
        await this.saveMemo(memo.date, memo.content);
        results.memos++;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Failed to migrate memo:', memo.date, error);
        }
      }
    }

    return results;
  }
}

export const api = new ApiService();
export default api;
