
/**
 * Common query keys for calendar events
 */
export const calendarEventQueries = {
  all: ['calendar-events'] as const,
  household: ['household-events'] as const,
  personal: ['personal-events'] as const,
  shared: ['shared-household-events'] as const,
  
  // Helper function to invalidate all event queries
  invalidateAll: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: calendarEventQueries.household });
    queryClient.invalidateQueries({ queryKey: calendarEventQueries.personal });
    queryClient.invalidateQueries({ queryKey: calendarEventQueries.shared });
  }
}
