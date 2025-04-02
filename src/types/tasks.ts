
export interface TaskProperties {
  priority: 'low' | 'medium' | 'high';
  status: string;
}

export interface GoalTask {
  id: string;
  goal_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  assigned_to_name?: string | null;
  target_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
  properties?: TaskProperties;
}

export type KanbanColumn = {
  id: string;
  title: string;
  tasks: GoalTask[];
};

export type ViewType = 'kanban' | 'list' | 'calendar' | 'weekly';
export type GroupBy = 'status' | 'date' | 'priority' | 'assignee';

export const DEFAULT_STATUSES = ['To Do', 'In Progress', 'Done'];
export const DEFAULT_PRIORITIES = ['low', 'medium', 'high'];
