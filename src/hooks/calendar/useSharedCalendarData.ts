
import { create } from 'zustand';
import { useCalendarEventsData } from './useCalendarEventsData';
import { CalendarEvent } from '@/types/calendar';

// Create a shared store for calendar state
interface CalendarStore {
  lastRefresh: number;
  forceRefresh: () => void;
}

const useCalendarStore = create<CalendarStore>((set) => ({
  lastRefresh: 0,
  forceRefresh: () => set({ lastRefresh: Date.now() }),
}));

/**
 * Shared calendar data hook that ensures both dashboard and main calendar 
 * use the same data source and stay in sync
 */
export function useSharedCalendarData() {
  const { forceRefresh, lastRefresh } = useCalendarStore();
  const calendarData = useCalendarEventsData();

  // Enhanced refetch that updates the shared store
  const sharedRefetch = async () => {
    const result = await calendarData.refetch();
    forceRefresh();
    return result;
  };

  const sharedManualRefresh = async () => {
    const result = await calendarData.manualRefresh();
    forceRefresh();
    return result;
  };

  // Transform events to include legacy assigned_to field for backward compatibility
  const enhancedEvents = calendarData.events.map((event: CalendarEvent) => ({
    ...event,
    assigned_to: event.assigned_to_member || event.assigned_to_child,
    assigned_user_profile: event.assigned_member_profile || event.assigned_child_profile ? {
      id: event.assigned_member_profile?.id || event.assigned_child_profile?.id || '',
      full_name: event.assigned_member_profile?.full_name || event.assigned_child_profile?.name || null,
      avatar_url: event.assigned_member_profile?.avatar_url || event.assigned_child_profile?.avatar_url || null
    } : null
  }));

  return {
    ...calendarData,
    events: enhancedEvents,
    refetch: sharedRefetch,
    manualRefresh: sharedManualRefresh,
    lastRefresh, // Expose for components that need to react to changes
  };
}
