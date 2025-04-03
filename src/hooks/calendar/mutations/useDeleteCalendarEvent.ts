
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { CalendarEvent } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { calendarEventQueries } from './calendarEventQueries';

/**
 * Hook for deleting calendar events
 */
export function useDeleteCalendarEvent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const deleteEvent = async (id: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    // First, determine if this is a household or personal event
    const { data: personalEvent } = await supabase
      .from('user_events')
      .select('id')
      .eq('id', id)
      .single();
      
    if (personalEvent) {
      const { error } = await supabase
        .from('user_events')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } else {
      // Assume it's a household event if not found in personal events
      const { error } = await supabase
        .from('household_events')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    }
  };
  
  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      calendarEventQueries.invalidateAll(queryClient);
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
