
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { calendarEventQueries } from '../mutations/calendarEventQueries';

/**
 * Hook to fetch personal events with improved caching
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
        
        // Fetch the user profile separately to ensure we have the latest data
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching user profile for personal events:', profileError);
        }
        
        // Fetch assigned member profiles
        const assignedMemberIds = data
          .map(event => event.assigned_to_member)
          .filter(id => id != null);
        
        let assignedMemberProfiles = [];
        if (assignedMemberIds.length > 0) {
          const { data: memberProfiles, error: memberProfilesError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', assignedMemberIds);

          if (memberProfilesError) {
            console.error('Error fetching assigned member profiles:', memberProfilesError);
          } else {
            assignedMemberProfiles = memberProfiles || [];
          }
        }

        // Fetch child profiles for assigned children
        const assignedChildIds = data
          .map(event => event.assigned_to_child)
          .filter(id => id != null);
        
        let childProfilesData = [];
        if (assignedChildIds.length > 0) {
          const { data: childProfiles, error: childProfilesError } = await supabase
            .from('child_profiles')
            .select('id, name, avatar_url')
            .in('id', assignedChildIds);

          if (childProfilesError) {
            console.error('Error fetching child profiles for personal events:', childProfilesError);
          } else {
            childProfilesData = childProfiles || [];
          }
        }

        // Create maps for quick lookup
        const memberProfilesMap = {};
        const childProfilesMap = {};
        
        assignedMemberProfiles.forEach(profile => {
          memberProfilesMap[profile.id] = profile;
        });
        
        childProfilesData.forEach(child => {
          childProfilesMap[child.id] = child;
        });
        
        // Use the fetched profile or fall back to the context profile
        const eventUserProfile = userProfile || profile;
        
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
          assigned_to_child: event.assigned_to_child,
          assigned_to_member: event.assigned_to_member,
          user_profile: eventUserProfile ? {
            full_name: eventUserProfile.full_name,
            avatar_url: eventUserProfile.avatar_url
          } : null,
          assigned_child_profile: event.assigned_to_child && childProfilesMap[event.assigned_to_child] ? {
            id: childProfilesMap[event.assigned_to_child].id,
            name: childProfilesMap[event.assigned_to_child].name,
            avatar_url: childProfilesMap[event.assigned_to_child].avatar_url
          } : null,
          assigned_member_profile: event.assigned_to_member && memberProfilesMap[event.assigned_to_member] ? {
            id: memberProfilesMap[event.assigned_to_member].id,
            full_name: memberProfilesMap[event.assigned_to_member].full_name,
            avatar_url: memberProfilesMap[event.assigned_to_member].avatar_url
          } : null
        }));
      } catch (error) {
        console.error('Error in usePersonalEvents:', error);
        throw error;
      }
    },
    enabled: !!user,
    refetchOnWindowFocus: false, // Disable automatic refetch on window focus
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes (increased from 30 seconds)
    gcTime: 10 * 60 * 1000 // Keep in cache for 10 minutes
  });
}
