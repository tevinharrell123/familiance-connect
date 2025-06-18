
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { calendarEventQueries } from '../mutations/calendarEventQueries';

/**
 * Hook to fetch household events with improved caching
 */
export function useHouseholdEvents() {
  const { user, household } = useAuth();

  return useQuery({
    queryKey: calendarEventQueries.household,
    queryFn: async (): Promise<CalendarEvent[]> => {
      if (!user || !household) return [];

      console.log('Fetching household events for household:', household.id);

      try {
        const { data: householdEvents, error: householdError } = await supabase
          .from('household_events')
          .select(`
            id,
            title,
            description,
            start_date,
            end_date,
            color,
            created_by,
            created_at,
            household_id,
            assigned_to_child,
            assigned_to_member
          `)
          .eq('household_id', household.id);

        if (householdError) {
          console.error('Error fetching household events:', householdError);
          throw householdError;
        }

        if (!householdEvents || householdEvents.length === 0) {
          console.log('No household events found');
          return [];
        }

        console.log('Found household events:', householdEvents.length);

        // Fetch profiles data for creators and assigned members in a single query
        const creatorIds = householdEvents.map(event => event.created_by);
        const assignedMemberIds = householdEvents
          .map(event => event.assigned_to_member)
          .filter(id => id != null);
        
        const allUserIds = [...new Set([...creatorIds, ...assignedMemberIds])];
        
        // Fetch all user profiles in a single query
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', allUserIds);

        if (profilesError) {
          console.error('Error fetching profiles for household events:', profilesError);
        }

        // Fetch child profiles for assigned children
        const assignedChildIds = householdEvents
          .map(event => event.assigned_to_child)
          .filter(id => id != null);
        
        let childProfilesData = [];
        if (assignedChildIds.length > 0) {
          const { data: childProfiles, error: childProfilesError } = await supabase
            .from('child_profiles')
            .select('id, name, avatar_url')
            .in('id', assignedChildIds);

          if (childProfilesError) {
            console.error('Error fetching child profiles for household events:', childProfilesError);
          } else {
            childProfilesData = childProfiles || [];
          }
        }

        // Create maps for quick lookup
        const profilesMap = {};
        const childProfilesMap = {};
        
        if (profilesData) {
          profilesData.forEach(profile => {
            profilesMap[profile.id] = profile;
          });
        }
        
        childProfilesData.forEach(child => {
          childProfilesMap[child.id] = child;
        });

        return householdEvents.map((event) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          start_date: event.start_date,
          end_date: event.end_date,
          color: event.color,
          is_household_event: true,
          created_by: event.created_by,
          created_at: event.created_at,
          user_id: event.created_by,
          assigned_to_child: event.assigned_to_child,
          assigned_to_member: event.assigned_to_member,
          user_profile: profilesMap[event.created_by] ? {
            full_name: profilesMap[event.created_by].full_name,
            avatar_url: profilesMap[event.created_by].avatar_url
          } : null,
          assigned_child_profile: event.assigned_to_child && childProfilesMap[event.assigned_to_child] ? {
            id: childProfilesMap[event.assigned_to_child].id,
            name: childProfilesMap[event.assigned_to_child].name,
            avatar_url: childProfilesMap[event.assigned_to_child].avatar_url
          } : null,
          assigned_member_profile: event.assigned_to_member && profilesMap[event.assigned_to_member] ? {
            id: profilesMap[event.assigned_to_member].id,
            full_name: profilesMap[event.assigned_to_member].full_name,
            avatar_url: profilesMap[event.assigned_to_member].avatar_url
          } : null
        }));
      } catch (error) {
        console.error('Error in useHouseholdEvents:', error);
        throw error;
      }
    },
    enabled: !!user && !!household,
    refetchOnWindowFocus: false, // Disable automatic refetch on window focus
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes (increased from 30 seconds)
    gcTime: 10 * 60 * 1000 // Keep in cache for 10 minutes
  });
}
