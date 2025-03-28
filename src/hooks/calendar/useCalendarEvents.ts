
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { CalendarEvent, CalendarFormValues } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';

export function useCalendarEvents() {
  const { user, household } = useAuth();
  const queryClient = useQueryClient();

  // Fetch household and personal events
  const fetchEvents = async (): Promise<CalendarEvent[]> => {
    if (!user) return [];

    const events: CalendarEvent[] = [];

    // Fetch household events if user belongs to a household
    if (household) {
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

      if (householdEvents) {
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

        events.push(
          ...householdEvents.map((event) => ({
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
          }))
        );
      }
    }

    // Fetch personal events
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

    if (userEvents) {
      // Fetch the user's own profile
      const { data: userProfile, error: userProfileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (userProfileError) {
        console.error('Error fetching user profile:', userProfileError);
      }

      events.push(
        ...userEvents.map((event) => ({
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
        }))
      );
    }

    // Fetch shared personal events from household members if user belongs to a household
    if (household) {
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
      
      if (householdMembers && householdMembers.length > 0) {
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

        if (sharedEvents && sharedEvents.length > 0) {
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
          
          events.push(
            ...sharedEvents.map((event) => ({
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
            }))
          );
        }
      }
    }

    return events;
  };

  const { data: events = [], isLoading, error, refetch } = useQuery({
    queryKey: ['calendar-events', user?.id, household?.id],
    queryFn: fetchEvents,
    enabled: !!user
  });

  // Create event mutation
  const createEvent = async (values: CalendarFormValues): Promise<CalendarEvent> => {
    if (!user) throw new Error('User not authenticated');
    
    const { title, description, start_date, end_date, color, is_household_event } = values;
    
    if (is_household_event) {
      if (!household) throw new Error('No household available');
      
      const { data, error } = await supabase
        .from('household_events')
        .insert({
          title,
          description,
          start_date: start_date.toISOString(),
          end_date: end_date.toISOString(),
          color,
          household_id: household.id,
          created_by: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Fetch user profile for the event
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile for created event:', profileError);
      }
      
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        start_date: data.start_date,
        end_date: data.end_date,
        color: data.color,
        is_household_event: true,
        created_by: user.id,
        created_at: data.created_at,
        user_id: user.id,
        user_profile: profile ? {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url
        } : null
      };
    } else {
      const { data, error } = await supabase
        .from('user_events')
        .insert({
          title,
          description,
          start_date: start_date.toISOString(),
          end_date: end_date.toISOString(),
          color,
          user_id: user.id,
          is_public: false // Default to private
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Fetch user profile for the event
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile for created event:', profileError);
      }
      
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        start_date: data.start_date,
        end_date: data.end_date,
        color: data.color,
        is_household_event: false,
        created_at: data.created_at,
        user_id: user.id,
        user_profile: profile ? {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url
        } : null
      };
    }
  };
  
  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: "Event created",
        description: "Your event has been successfully created.",
      });
    },
    onError: (error) => {
      console.error('Error creating event:', error);
      toast({
        title: "Failed to create event",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Update event mutation
  const updateEvent = async (event: CalendarEvent): Promise<CalendarEvent> => {
    if (!user) throw new Error('User not authenticated');
    
    const { id, title, description, start_date, end_date, color, is_household_event } = event;
    
    if (is_household_event) {
      const { data, error } = await supabase
        .from('household_events')
        .update({
          title,
          description,
          start_date,
          end_date,
          color,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Get updated user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', data.created_by)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile for updated event:', profileError);
      }
      
      return {
        ...data,
        is_household_event: true,
        user_profile: profile ? {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url
        } : event.user_profile
      };
    } else {
      const { data, error } = await supabase
        .from('user_events')
        .update({
          title,
          description,
          start_date,
          end_date,
          color,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Get updated user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', data.user_id)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile for updated event:', profileError);
      }
      
      return {
        ...data,
        is_household_event: false,
        user_profile: profile ? {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url
        } : event.user_profile
      };
    }
  };
  
  const updateEventMutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: "Event updated",
        description: "Your event has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error('Error updating event:', error);
      toast({
        title: "Failed to update event",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Delete event mutation
  const deleteEvent = async (event: CalendarEvent): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    const { id, is_household_event } = event;
    
    if (is_household_event) {
      const { error } = await supabase
        .from('household_events')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('user_events')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    }
  };
  
  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: "Event deleted",
        description: "Your event has been successfully deleted.",
      });
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
      toast({
        title: "Failed to delete event",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  return {
    events,
    isLoading,
    error,
    refetch,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending
  };
}
