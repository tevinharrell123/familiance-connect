import { useHouseholdEvents } from './events/useHouseholdEvents';
import { usePersonalEvents } from './events/usePersonalEvents';
import { useSharedHouseholdMemberEvents } from './events/useSharedHouseholdMemberEvents';
import { useEffect, useCallback, useRef, useState } from 'react';

/**
 * Hook to combine all event sources
 */
export function useCalendarEventsData() {
  const householdEventsQuery = useHouseholdEvents();
  const personalEventsQuery = usePersonalEvents();
  const sharedEventsQuery = useSharedHouseholdMemberEvents();
  
  // Add a ref to prevent refresh loops
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshTimeRef = useRef<number>(0);
  // State to track whether a refresh is in progress
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    // Check if we're already refreshing
    if (isRefreshing) {
      console.log('Skipping refetch - already in progress');
      return Promise.resolve();
    }
    
    // Throttle refreshes - at most once every 2 seconds
    const now = Date.now();
    if (now - lastRefreshTimeRef.current < 2000) {
      console.log('Skipping refetch - too soon after last refresh');
      return Promise.resolve();
    }
    
    console.log('Refetching all calendar events');
    setIsRefreshing(true);
    lastRefreshTimeRef.current = now;
    
    return Promise.all([
      householdEventsQuery.refetch(),
      personalEventsQuery.refetch(),
      sharedEventsQuery.refetch()
    ])
    .finally(() => {
      setIsRefreshing(false);
    });
  }, [householdEventsQuery, personalEventsQuery, sharedEventsQuery, isRefreshing]);

  // Set up periodic refetching to keep events in sync across household
  // But make sure to properly clean up and prevent multiple intervals
  useEffect(() => {
    console.log('Setting up auto-refresh for calendar events');
    
    // Clear any existing interval before setting a new one
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    // Set up a new refresh interval - using 5 minutes
    refreshIntervalRef.current = setInterval(() => {
      console.log('Auto-refreshing calendar events');
      refetch();
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    return () => {
      console.log('Cleaning up calendar events auto-refresh');
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [refetch]);

  return {
    events,
    isLoading,
    error,
    refetch
  };
}
