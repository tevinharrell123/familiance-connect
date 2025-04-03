
// Create a combined hook for all calendar event mutations
import { useCreateCalendarEvent } from './mutations/useCreateCalendarEvent';
import { useUpdateCalendarEvent } from './mutations/useUpdateCalendarEvent';
import { useDeleteCalendarEvent } from './mutations/useDeleteCalendarEvent';
import { calendarEventQueries } from './mutations/calendarEventQueries';
import { CalendarEvent, CalendarFormValues } from '@/types/calendar';

/**
 * Combined hook for all calendar event mutations
 */
export function useCalendarEventMutations() {
  const createEventMutation = useCreateCalendarEvent();
  const updateEventMutation = useUpdateCalendarEvent();
  const deleteEventMutation = useDeleteCalendarEvent();
  
  return {
    createEvent: (data: CalendarFormValues) => createEventMutation.mutate(data),
    updateEvent: (data: CalendarEvent) => updateEventMutation.mutate(data),
    deleteEvent: (id: string) => deleteEventMutation.mutate(id),
    isLoading: createEventMutation.isPending || updateEventMutation.isPending || deleteEventMutation.isPending,
    createIsLoading: createEventMutation.isPending,
    updateIsLoading: updateEventMutation.isPending,
    deleteIsLoading: deleteEventMutation.isPending
  };
}

// Re-export other mutation hooks and queries
export { useCreateCalendarEvent } from './mutations/useCreateCalendarEvent';
export { useUpdateCalendarEvent } from './mutations/useUpdateCalendarEvent';
export { useDeleteCalendarEvent } from './mutations/useDeleteCalendarEvent';
export { calendarEventQueries } from './mutations/calendarEventQueries';
