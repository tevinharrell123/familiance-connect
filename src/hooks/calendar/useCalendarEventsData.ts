
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to fetch household events from Supabase
 */
export function useHouseholdEvents() {
  const { user, household } = useAuth();

  return useQuery({
    queryKey: ['household-events', household?.id],
    queryFn: async (): Promise<CalendarEvent[]> => {
      if (!user || !household) return [];

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
          household_id
        `)
        .eq('household_id', household.id);

      if (householdError) {
        console.error('Error fetching household events:', householdError);
        throw householdError;
      }

      if (!householdEvents || householdEvents.length === 0) {
        return [];
      }

      // Fetch profiles data separately for creators of household events
      const creatorIds = householdEvents.map(event => event.created_by);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', creatorIds);

      if (profilesError) {
        console.error('Error fetching profiles for household events:', profilesError);
      }

      // Create a map of user profiles for quick lookup
      const profilesMap = (profilesData || []).reduce((map, profile) => {
        map[profile.id] = profile;
        return map;
      }, {});

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
        user_profile: profilesMap[event.created_by] ? {
          full_name: profilesMap[event.created_by].full_name,
          avatar_url: profilesMap[event.created_by].avatar_url
        } : null
      }));
    },
    enabled: !!user && !!household
  });
}

/**
 * Hook to fetch personal events from Supabase
 */
export function usePersonalEvents() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['personal-events', user?.id],
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

/**
 * Hook to fetch shared events from household members
 */
export function useSharedHouseholdMemberEvents() {
  const { user, household } = useAuth();

  return useQuery({
    queryKey: ['shared-household-events', user?.id, household?.id],
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
    enabled: !!user && !!household
  });
}

/**
 * Hook to combine all event sources
 */
export function useCalendarEventsData() {
  const { data: householdEvents = [], isLoading: isLoadingHousehold, error: householdError } = useHouseholdEvents();
  const { data: personalEvents = [], isLoading: isLoadingPersonal, error: personalError } = usePersonalEvents();
  const { data: sharedEvents = [], isLoading: isLoadingShared, error: sharedError } = useSharedHouseholdMemberEvents();

  const isLoading = isLoadingHousehold || isLoadingPersonal || isLoadingShared;
  const error = householdError || personalError || sharedError;
  const events = [...householdEvents, ...personalEvents, ...sharedEvents];

  return {
    events,
    isLoading,
    error
  };
}
