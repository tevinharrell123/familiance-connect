
export interface TaskProperty {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multi-select' | 'status' | 'date' | 'person' | 'files-media' | 'checkbox' | 'url' | 'email' | 'phone' | 'formula' | 'relation' | 'rollup';
  value: any;
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
  properties?: TaskProperty[];
}
