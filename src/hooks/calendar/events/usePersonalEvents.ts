
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { calendarEventQueries } from '../mutations/calendarEventQueries';

/**
 * Hook to fetch personal events from Supabase
 */
export function usePersonalEvents() {
  const { user } = useAuth();

  return useQuery({
    queryKey: calendarEventQueries.personal,
    queryFn: async (): Promise<CalendarEvent[]> => {
      if (!user) return [];

      const { data: userEvents, error: userError } = await supabase
        .from('user_events')
        .select(`
          id,
          title,
          description,
          start_date,
          end_date,
          color,
          user_id,
          is_public,
          created_at
        `)
        .eq('user_id', user.id);

      if (userError) {
        console.error('Error fetching user events:', userError);
        throw userError;
      }

      if (!userEvents || userEvents.length === 0) {
        return [];
      }

      // Fetch the user's own profile
      const { data: userProfile, error: userProfileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (userProfileError) {
        console.error('Error fetching user profile:', userProfileError);
      }

      return userEvents.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start_date: event.start_date,
        end_date: event.end_date,
        color: event.color,
        is_household_event: false,
        created_at: event.created_at,
        user_id: event.user_id,
        user_profile: userProfile ? {
          full_name: userProfile.full_name,
          avatar_url: userProfile.avatar_url
        } : null
      }));
    },
    enabled: !!user
  });
}
