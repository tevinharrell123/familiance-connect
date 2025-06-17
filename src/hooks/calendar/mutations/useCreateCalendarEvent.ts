
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent, CalendarFormValues } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { calendarEventQueries } from './calendarEventQueries';
import { QueryClient, useQueryClient } from '@tanstack/react-query';

export function useCreateCalendarEvent() {
  const { user, household } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (values: CalendarFormValues): Promise<CalendarEvent | null> => {
      if (!user) throw new Error('User is not authenticated');
      
      const { 
        title, 
        description, 
        start_date, 
        end_date, 
        color, 
        is_household_event, 
        is_public = true,
        assigned_to_child,
        assigned_to_member,
        recurrence_type = 'none',
        recurrence_end,
        category
      } = values;
      
      if (is_household_event) {
        if (!household) throw new Error('User is not in a household');
        
        const { data, error } = await supabase
          .from('household_events')
          .insert({
            title,
            description,
            start_date: start_date.toISOString(),
            end_date: end_date.toISOString(),
            color,
            created_by: user.id,
            household_id: household.id,
            assigned_to_child: assigned_to_child || null
          })
          .select()
          .single();
          
        if (error) {
          console.error('Error creating household event:', error);
          throw error;
        }
        
        return {
          ...data,
          is_household_event: true,
          user_profile: null,
          assigned_to_member: assigned_to_member || null,
          recurrence_type: recurrence_type || null,
          recurrence_end: recurrence_end?.toISOString() || null,
          category: category || null
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
            is_public,
            assigned_to_child: assigned_to_child || null
          })
          .select()
          .single();
          
        if (error) {
          console.error('Error creating personal event:', error);
          throw error;
        }
        
        return {
          ...data,
          is_household_event: false,
          user_profile: null,
          assigned_to_member: assigned_to_member || null,
          recurrence_type: recurrence_type || null,
          recurrence_end: recurrence_end?.toISOString() || null,
          category: category || null
        };
      }
    },
    onSuccess: () => {
      // After successfully creating an event, invalidate related queries to update the UI
      queryClient.invalidateQueries({ queryKey: calendarEventQueries.personal });
      queryClient.invalidateQueries({ queryKey: calendarEventQueries.household });
      queryClient.invalidateQueries({ queryKey: calendarEventQueries.shared });
    }
  });
}
