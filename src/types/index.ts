export interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  notes?: string;
  targetMarket?: string;
  potentialRevenue?: string;
  resources?: string;
  timeline?: string;
}

export interface IdeaFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: Idea['status'];
  priority: Idea['priority'];
  notes?: string;
  targetMarket?: string;
  potentialRevenue?: string;
  resources?: string;
  timeline?: string;
}