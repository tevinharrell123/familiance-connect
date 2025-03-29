import { useHouseholdEvents } from './events/useHouseholdEvents';
import { usePersonalEvents } from './events/usePersonalEvents';
import { useSharedHouseholdMemberEvents } from './events/useSharedHouseholdMemberEvents';
import { useEffect, useCallback } from 'react';

/**
 * Hook to combine all event sources
 */
export function useCalendarEventsData() {
  const householdEventsQuery = useHouseholdEvents();
  const personalEventsQuery = usePersonalEvents();
  const sharedEventsQuery = useSharedHouseholdMemberEvents();

  const { data: householdEvents = [] } = householdEventsQuery;
  const { data: personalEvents = [] } = personalEventsQuery;
  const { data: sharedEvents = [] } = sharedEventsQuery;

  const isLoading = 
    householdEventsQuery.isLoading || 
    personalEventsQuery.isLoading || 
    sharedEventsQuery.isLoading;
    
  const error = 
    householdEventsQuery.error || 
    personalEventsQuery.error || 
    sharedEventsQuery.error;
    
  const events = [...householdEvents, ...personalEvents, ...sharedEvents];

  // Define refetch callback to use in useEffect
  const refetch = useCallback(() => {
    console.log('Refetching all calendar events');
    return Promise.all([
      householdEventsQuery.refetch(),
      personalEventsQuery.refetch(),
      sharedEventsQuery.refetch()
    ]);
  }, [householdEventsQuery, personalEventsQuery, sharedEventsQuery]);

  // Set up periodic refetching to keep events in sync across household
  useEffect(() => {
    console.log('Setting up auto-refresh for calendar events');
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing calendar events');
      refetch();
    }, 2 * 60 * 1000); // Refresh every 2 minutes
    
    return () => {
      console.log('Cleaning up calendar events auto-refresh');
      clearInterval(intervalId);
    };
  }, [refetch]);

  return {
    events,
    isLoading,
    error,
    refetch
  };
}
