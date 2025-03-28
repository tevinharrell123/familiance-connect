
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
