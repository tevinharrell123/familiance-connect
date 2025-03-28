
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { CalendarEvent } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';

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
