
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { CalendarEvent, CalendarFormValues } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook for creating calendar events
 */
export function useCreateCalendarEvent() {
  const { user, household } = useAuth();
  const queryClient = useQueryClient();

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
        
      if (error) {
        console.error('Error creating household event:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create household event, no data returned');
      }
      
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
        
      if (error) {
        console.error('Error creating user event:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create user event, no data returned');
      }
      
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
      console.log('Successfully created event, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['household-events'] });
      queryClient.invalidateQueries({ queryKey: ['personal-events'] });
      queryClient.invalidateQueries({ queryKey: ['shared-household-events'] });
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

  return createEventMutation;
}

/**
 * Hook for updating calendar events
 */
export function useUpdateCalendarEvent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ['household-events'] });
      queryClient.invalidateQueries({ queryKey: ['personal-events'] });
      queryClient.invalidateQueries({ queryKey: ['shared-household-events'] });
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

  return updateEventMutation;
}

/**
 * Hook for deleting calendar events
 */
export function useDeleteCalendarEvent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ['household-events'] });
      queryClient.invalidateQueries({ queryKey: ['personal-events'] });
      queryClient.invalidateQueries({ queryKey: ['shared-household-events'] });
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

  return deleteEventMutation;
}
