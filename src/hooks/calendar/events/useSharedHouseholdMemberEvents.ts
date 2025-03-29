
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

      console.log(`Fetching shared events for household: ${household.id}`);

      try {
        // Get household members (excluding current user)
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
          console.log('No other household members found');
          return [];
        }
        
        const memberIds = householdMembers.map(m => m.user_id);
        console.log(`Found ${memberIds.length} household members to fetch shared events from: ${memberIds.join(', ')}`);
        
        // Fetch public events from household members
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
          console.log('No shared events found from household members');
          return [];
        }

        console.log(`Found ${sharedEvents.length} shared events from household members: ${sharedEvents.map(e => e.id).join(', ')}`);

        // Fetch profile data for all members
        const { data: memberProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', memberIds);

        if (profilesError) {
          console.error('Error fetching member profiles:', profilesError);
          throw profilesError;
        }

        // Create a map of profiles for faster lookup
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
      } catch (error) {
        console.error('Error in useSharedHouseholdMemberEvents:', error);
        throw error;
      }
    },
    enabled: !!user && !!household,
    refetchInterval: 1 * 60 * 1000, // Reduce to 1 minute to ensure more frequent syncing
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000 // Reduce to 30 seconds to ensure fresher data
  });
}
