
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
}

export type CalendarViewType = 'day' | 'week';

export interface CalendarFormValues {
  title: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  color?: string;
  is_household_event: boolean;
  is_public?: boolean;
}
