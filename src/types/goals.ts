
export interface FamilyGoal {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  category: string;
  target_date: string | null;
  assigned_to: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  assigned_to_name?: string | null;
  completed: boolean; // Add this line
}
