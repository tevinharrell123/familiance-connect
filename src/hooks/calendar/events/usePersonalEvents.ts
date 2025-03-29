
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { calendarEventQueries } from '../mutations/calendarEventQueries';

/**
 * Hook to fetch personal events
 */
export function usePersonalEvents() {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: calendarEventQueries.personal,
    queryFn: async (): Promise<CalendarEvent[]> => {
      if (!user) return [];

      try {
        console.log(`Fetching personal events for user: ${user.id}`);
        
        const { data, error } = await supabase
          .from('user_events')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error fetching personal events:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.log('No personal events found');
          return [];
        }
        
        console.log(`Found ${data.length} personal events`);
        
        return data.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          start_date: event.start_date,
          end_date: event.end_date,
          color: event.color,
          is_household_event: false,
          created_at: event.created_at,
          user_id: user.id,
          user_profile: profile ? {
            full_name: profile.full_name,
            avatar_url: profile.avatar_url
          } : null
        }));
      } catch (error) {
        console.error('Error in usePersonalEvents:', error);
        throw error;
      }
    },
    enabled: !!user,
    refetchInterval: 1 * 60 * 1000, // Refresh every minute
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000 // Consider data stale after 30 seconds
  });
}
