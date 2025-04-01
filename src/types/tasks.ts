
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
  properties: TaskProperties;
  status: TaskStatus;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked' | string;

export interface TaskProperties {
  status?: TaskStatus;
  priority?: 'low' | 'medium' | 'high';
  type?: string;
  [key: string]: any;
}

export type GroupByOption = 'status' | 'assigned_to' | 'priority' | 'type' | 'goal_id';
