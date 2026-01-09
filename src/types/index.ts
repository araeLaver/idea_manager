// Status and Priority types
export type IdeaStatus = 'draft' | 'in-progress' | 'completed' | 'archived';
export type IdeaPriority = 'low' | 'medium' | 'high';

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: IdeaStatus;
  priority: IdeaPriority;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  targetMarket?: string;
  potentialRevenue?: string;
  resources?: string;
  timeline?: string;
  deadline?: string;
  reminderEnabled?: boolean;
  reminderDays?: number; // 마감일 며칠 전 알림
}

export interface IdeaFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: IdeaStatus;
  priority: IdeaPriority;
  notes?: string;
  targetMarket?: string;
  potentialRevenue?: string;
  resources?: string;
  timeline?: string;
  deadline?: string;
  reminderEnabled?: boolean;
  reminderDays?: number;
}

// Notification types
export type NotificationType = 'deadline' | 'reminder' | 'info' | 'success' | 'warning';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  ideaId?: string;
  createdAt: string;
  read: boolean;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

// Auth response types
export interface AuthResponse {
  user: User;
  token: string;
}

// Pagination types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// Simple data wrapper response
export interface DataResponse<T> {
  data: T;
}

// Memo types
export interface DailyMemo {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// History types
export type HistoryAction = 'created' | 'updated' | 'status_changed' | 'deleted';

export interface IdeaHistory {
  id: string;
  ideaId: string;
  ideaTitle?: string;
  userId: string;
  action: HistoryAction;
  oldValues?: Partial<Idea>;
  newValues?: Partial<Idea>;
  changedAt: string;
}

// Stats types
export interface Stats {
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

// API filter types
export interface IdeaFilters {
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Message response
export interface MessageResponse {
  message: string;
}

// Password reset types
export interface PasswordResetVerifyResponse {
  valid: boolean;
}