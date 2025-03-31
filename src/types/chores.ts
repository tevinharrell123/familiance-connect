
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type ChoreFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface Chore {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  assigned_to_name?: string | null;
  weekdays: WeekDay[];
  frequency: ChoreFrequency;
  points: number;
  completed_dates: string[]; // Array of ISO date strings when this chore was completed
  created_at: string;
  updated_at: string;
}
