import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { calendarEventQueries } from '../mutations/calendarEventQueries';

/**
 * Hook to fetch shared events from household members
 */
export function useSharedHouseholdMemberEvents() {
  const { user, household } = useAuth();

  return useQuery({
    queryKey: calendarEventQueries.shared,
    queryFn: async (): Promise<CalendarEvent[]> => {
      if (!user || !household) return [];

      // Get all household members
      const { data: householdMembers, error: membersError } = await supabase
        .from('household_members')
        .select('user_id')
        .eq('household_id', household.id)
        .neq('user_id', user.id);
          
      if (membersError) {
        console.error('Error fetching household members:', membersError);
        throw membersError;
      }
      
      if (!householdMembers || householdMembers.length === 0) {
        return [];
      }
      
      const memberIds = householdMembers.map(m => m.user_id);
      
      // Fetch public events from those members
      const { data: sharedEvents, error: sharedError } = await supabase
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
        .eq('is_public', true)
        .in('user_id', memberIds);

      if (sharedError) {
        console.error('Error fetching shared events:', sharedError);
        throw sharedError;
      }
      
      if (!sharedEvents || sharedEvents.length === 0) {
        return [];
      }

      // Fetch profiles for the members
      const { data: memberProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', memberIds);

      if (profilesError) {
        console.error('Error fetching member profiles:', profilesError);
      }

      // Create a map of member profiles
      const profilesMap = (memberProfiles || []).reduce((map, profile) => {
        map[profile.id] = profile;
        return map;
      }, {});
      
      return sharedEvents.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start_date: event.start_date,
        end_date: event.end_date,
        color: event.color,
        is_household_event: false,
        created_at: event.created_at,
        user_id: event.user_id,
        user_profile: profilesMap[event.user_id] ? {
          full_name: profilesMap[event.user_id].full_name,
          avatar_url: profilesMap[event.user_id].avatar_url
        } : null
      }));
    },
    enabled: !!user && !!household,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    staleTime: 30000
  });
}
