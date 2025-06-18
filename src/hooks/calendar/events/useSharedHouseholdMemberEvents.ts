
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { calendarEventQueries } from '../mutations/calendarEventQueries';

/**
 * Hook to fetch shared events from household members with improved caching
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
        
        // Fetch public events from household members - make sure is_public is true
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
            created_at,
            assigned_to_child,
            assigned_to_member
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

        console.log(`Found ${sharedEvents.length} shared events from household members`);

        // Get all unique user IDs for profile fetching
        const assignedMemberIds = sharedEvents
          .map(event => event.assigned_to_member)
          .filter(id => id != null);
        const allUserIds = [...new Set([...memberIds, ...assignedMemberIds])];

        // Immediately fetch profile data for all members in a single query
        const { data: memberProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', allUserIds);

        if (profilesError) {
          console.error('Error fetching member profiles:', profilesError);
          throw profilesError;
        }

        // Fetch child profiles for assigned children
        const assignedChildIds = sharedEvents
          .map(event => event.assigned_to_child)
          .filter(id => id != null);
        
        let childProfilesData = [];
        if (assignedChildIds.length > 0) {
          const { data: childProfiles, error: childProfilesError } = await supabase
            .from('child_profiles')
            .select('id, name, avatar_url')
            .in('id', assignedChildIds);

          if (childProfilesError) {
            console.error('Error fetching child profiles for shared events:', childProfilesError);
          } else {
            childProfilesData = childProfiles || [];
          }
        }

        // Create maps of profiles for faster lookup
        const profilesMap = {};
        const childProfilesMap = {};
        
        if (memberProfiles) {
          memberProfiles.forEach(profile => {
            profilesMap[profile.id] = profile;
          });
        }
        
        childProfilesData.forEach(child => {
          childProfilesMap[child.id] = child;
        });
        
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
          is_public: event.is_public,
          assigned_to_child: event.assigned_to_child,
          assigned_to_member: event.assigned_to_member,
          user_profile: profilesMap[event.user_id] ? {
            full_name: profilesMap[event.user_id].full_name,
            avatar_url: profilesMap[event.user_id].avatar_url
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
        console.error('Error in useSharedHouseholdMemberEvents:', error);
        throw error;
      }
    },
    enabled: !!user && !!household,
    refetchOnWindowFocus: false, // Disable automatic refetch on window focus
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes (increased from 10 seconds)
    gcTime: 10 * 60 * 1000 // Keep in cache for 10 minutes
  });
}
