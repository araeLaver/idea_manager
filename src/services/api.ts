const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    return this.token;
  }

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
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async register(email: string, password: string, name: string) {
    const data = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async logout() {
    this.setToken(null);
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me');
  }

  async updateProfile(data: { name?: string; email?: string }) {
    return this.request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Ideas
  async getIdeas(filters?: {
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return this.request<{
      data: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>(`/ideas${query ? `?${query}` : ''}`);
  }

  // Get all ideas without pagination (for backwards compatibility)
  async getAllIdeas(filters?: {
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    // Set high limit to get all ideas
    params.append('limit', '10000');
    const query = params.toString();
    const result = await this.request<{
      data: any[];
      pagination: any;
    }>(`/ideas${query ? `?${query}` : ''}`);
    return result.data;
  }

  async getIdea(id: string) {
    return this.request<any>(`/ideas/${id}`);
  }

  async createIdea(data: any) {
    return this.request<any>('/ideas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIdea(id: string, data: any) {
    return this.request<any>(`/ideas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteIdea(id: string) {
    return this.request<{ message: string }>(`/ideas/${id}`, {
      method: 'DELETE',
    });
  }

  async getStats() {
    return this.request<any>('/ideas/stats/summary');
  }

  async bulkUpdateStatus(ids: string[], status: string) {
    return this.request<{ message: string }>('/ideas/bulk/status', {
      method: 'PATCH',
      body: JSON.stringify({ ids, status }),
    });
  }

  // Memos
  async getMemos(month?: number, year?: number) {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    const query = params.toString();
    return this.request<any[]>(`/memos${query ? `?${query}` : ''}`);
  }

  async getMemoByDate(date: string) {
    return this.request<any | null>(`/memos/date/${date}`);
  }

  async saveMemo(date: string, content: string) {
    return this.request<any>('/memos', {
      method: 'POST',
      body: JSON.stringify({ date, content }),
    });
  }

  async deleteMemo(id: string) {
    return this.request<{ message: string }>(`/memos/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteMemoByDate(date: string) {
    return this.request<{ message: string }>(`/memos/date/${date}`, {
      method: 'DELETE',
    });
  }

  // History
  async getHistory(limit?: number, offset?: number) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    const query = params.toString();
    return this.request<any[]>(`/history${query ? `?${query}` : ''}`);
  }

  async getIdeaHistory(ideaId: string) {
    return this.request<any[]>(`/history/idea/${ideaId}`);
  }

  async getRecentActivity() {
    return this.request<any[]>('/history/recent');
  }
}

export const api = new ApiService();
export default api;
