export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  color?: string | null;
  is_household_event: boolean;
  created_by?: string;
  created_at: string;
  user_id?: string;
  user_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  isMultiDay?: boolean;
  duration?: number;
  is_public?: boolean;
  assigned_to_child?: string | null;
  assigned_to_member?: string | null;
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly' | null;
  recurrence_end?: string | null;
  category?: string | null;
  assigned_child_profile?: {
    id: string;
    name: string;
    avatar_url?: string | null;
  } | null;
  assigned_member_profile?: {
    id: string;
    full_name: string | null;
    avatar_url?: string | null;
  } | null;
  // Legacy support - unified assigned person
  assigned_to?: string;
  assigned_user_profile?: {
    id: string;
    full_name: string | null;
    avatar_url?: string | null;
  } | null;
}

export type CalendarViewType = 'day' | 'week' | 'month';

export interface CalendarFormValues {
  title: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  color?: string;
  is_household_event: boolean;
  is_public?: boolean;
  assigned_to_child?: string;
  assigned_to_member?: string;
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrence_end?: Date;
  category?: string;
  // Legacy support
  assigned_to?: string;
}

export const EVENT_CATEGORIES = [
  'School',
  'Medical',
  'Sports',
  'Work',
  'Family',
  'Social',
  'Travel',
  'Appointments',
  'Other'
] as const;

export const PERSON_COLORS = [
  '#7B68EE', // Blue
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Light Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E9', // Sky Blue
  '#F8C471'  // Orange
] as const;

export const CATEGORY_COLORS = {
  'School': '#4A90E2',
  'Medical': '#E74C3C',
  'Sports': '#27AE60',
  'Work': '#8E44AD',
  'Family': '#F39C12',
  'Social': '#E91E63',
  'Travel': '#16A085',
  'Appointments': '#34495E',
  'Other': '#95A5A6'
} as const;
