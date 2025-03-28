
import { useHouseholdEvents } from './events/useHouseholdEvents';
import { usePersonalEvents } from './events/usePersonalEvents';
import { useSharedHouseholdMemberEvents } from './events/useSharedHouseholdMemberEvents';

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

  const refetch = () => {
    console.log('Refetching all calendar events');
    return Promise.all([
      householdEventsQuery.refetch(),
      personalEventsQuery.refetch(),
      sharedEventsQuery.refetch()
    ]);
  };

  return {
    events,
    isLoading,
    error,
    refetch
  };
}
