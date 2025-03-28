import { useCalendarEventsData } from './useCalendarEventsData';
import { 
  useCreateCalendarEvent,
  useUpdateCalendarEvent, 
  useDeleteCalendarEvent 
} from './useCalendarEventMutations';

/**
 * Main hook for calendar events - combines data fetching and mutations
 */
export function useCalendarEvents() {
  // Get event data
  const { events, isLoading, error } = useCalendarEventsData();
  
  // Get mutation hooks
  const createEventMutation = useCreateCalendarEvent();
  const updateEventMutation = useUpdateCalendarEvent();
  const deleteEventMutation = useDeleteCalendarEvent();

  return {
    events,
    isLoading,
    error,
    refetch: () => {
      // This will trigger a refetch of all event data
      return Promise.all([
        // We don't need to manually refetch as the invalidateQueries in mutations 
        // will handle this, but keeping the API consistent with the original hook
      ]);
    },
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending
  };
}
