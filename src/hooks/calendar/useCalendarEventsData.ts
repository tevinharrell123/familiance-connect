
import { useHouseholdEvents } from './events/useHouseholdEvents';
import { usePersonalEvents } from './events/usePersonalEvents';
import { useSharedHouseholdMemberEvents } from './events/useSharedHouseholdMemberEvents';
import { useEffect, useCallback, useRef, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

/**
 * Hook to combine all event sources with optimized refresh behavior
 */
export function useCalendarEventsData() {
  const householdEventsQuery = useHouseholdEvents();
  const personalEventsQuery = usePersonalEvents();
  const sharedEventsQuery = useSharedHouseholdMemberEvents();
  
  // Add a ref to prevent refresh loops and track visibility
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshTimeRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);
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
    
  // Combine all event sources
  const events = [...householdEvents, ...personalEvents, ...sharedEvents];

  // Define refetch callback with improved throttling
  const refetch = useCallback(() => {
    // Check if we're already refreshing
    if (isRefreshing) {
      console.log('Skipping refetch - already in progress');
      return Promise.resolve();
    }
    
    // Throttle refreshes - at most once every 10 seconds for manual refreshes
    const now = Date.now();
    if (now - lastRefreshTimeRef.current < 10000) {
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
    .then((results) => {
      console.log(`Refreshed successfully: ${results.length} queries`);
      return results;
    })
    .catch((error) => {
      console.error('Error refreshing calendar events:', error);
      toast({
        title: "Refresh failed",
        description: "There was an error refreshing calendar data",
        variant: "destructive"
      });
      throw error;
    })
    .finally(() => {
      setIsRefreshing(false);
    });
  }, [householdEventsQuery, personalEventsQuery, sharedEventsQuery, isRefreshing]);

  // Manual refresh function for user-triggered updates
  const manualRefresh = useCallback(() => {
    // Allow manual refresh even if recent auto-refresh occurred
    lastRefreshTimeRef.current = 0;
    return refetch();
  }, [refetch]);

  // Set up visibility tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      console.log('Calendar visibility changed:', isVisibleRef.current ? 'visible' : 'hidden');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Set up periodic refetching with improved interval and visibility checking
  useEffect(() => {
    console.log('Setting up auto-refresh for calendar events (5 minute interval)');
    
    // Clear any existing interval before setting a new one
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    // Set up a new refresh interval - changed to 5 minutes for less aggressive syncing
    refreshIntervalRef.current = setInterval(() => {
      // Only auto-refresh if the page is visible
      if (isVisibleRef.current) {
        console.log('Auto-refreshing calendar events (5 min interval)');
        refetch().catch(err => {
          console.error('Auto-refresh failed:', err);
        });
      } else {
        console.log('Skipping auto-refresh - page not visible');
      }
    }, 5 * 60 * 1000); // Changed to 5 minutes (300 seconds)
    
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
    refetch,
    manualRefresh,
    isRefreshing
  };
}
