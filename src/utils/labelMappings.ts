import type { IdeaStatus, IdeaPriority } from '../types';

/** Maps status values to Korean display labels */
export const STATUS_LABELS: Record<IdeaStatus, string> = {
  'draft': '초안',
  'in-progress': '진행중',
  'completed': '완료',
  'archived': '보관됨',
};

/** Maps status values to CSS class names */
export const STATUS_CLASSES: Record<IdeaStatus, string> = {
  'draft': 'status-draft',
  'in-progress': 'status-in-progress',
  'completed': 'status-completed',
  'archived': 'status-archived',
};

/** Maps status values to gradient backgrounds */
export const STATUS_GRADIENTS: Record<IdeaStatus, string> = {
  'draft': 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
  'in-progress': 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
  'completed': 'linear-gradient(135deg, #22c55e 0%, #14b8a6 100%)',
  'archived': 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
};

/** Maps priority values to Korean display labels */
export const PRIORITY_LABELS: Record<IdeaPriority, string> = {
  'low': '낮음',
  'medium': '보통',
  'high': '높음',
};

/** Maps priority values to CSS color classes */
export const PRIORITY_COLORS: Record<IdeaPriority, string> = {
  'low': 'text-gray-500 bg-gray-100',
  'medium': 'text-warning bg-warning-light',
  'high': 'text-error bg-error-light',
};

/** Maps priority values to CSS class names */
export const PRIORITY_CLASSES: Record<IdeaPriority, string> = {
  'low': 'priority-low',
  'medium': 'priority-medium',
  'high': 'priority-high',
};

/** Get Korean label for status value */
export function getStatusLabel(status: IdeaStatus): string {
  return STATUS_LABELS[status] || status;
}

/** Get CSS class for status badge */
export function getStatusClass(status: IdeaStatus): string {
  return STATUS_CLASSES[status] || 'status-draft';
}

/** Get gradient background for status indicator */
export function getStatusGradient(status: IdeaStatus): string {
  return STATUS_GRADIENTS[status] || STATUS_GRADIENTS.draft;
}

/** Get Korean label for priority value */
export function getPriorityLabel(priority: IdeaPriority): string {
  return PRIORITY_LABELS[priority] || priority;
}

/** Get CSS color class for priority badge */
export function getPriorityColor(priority: IdeaPriority): string {
  return PRIORITY_COLORS[priority] || 'text-tertiary bg-secondary';
}

/** Get CSS class for priority badge */
export function getPriorityClass(priority: IdeaPriority): string {
  return PRIORITY_CLASSES[priority] || 'priority-medium';
}
