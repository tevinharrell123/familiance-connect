
import { useState, useEffect } from 'react';
import { CalendarEvent, CalendarFormValues } from '@/types/calendar';
import { addDays, format, startOfDay, endOfDay, parseISO, setHours } from 'date-fns';
import { useCalendarEventsData } from '@/hooks/calendar/useCalendarEventsData';
import { useCalendarEventMutations } from '@/hooks/calendar/useCalendarEventMutations';
import { useFamilyMembers } from '@/hooks/household/useFamilyMembers';
import { useChildProfiles } from '@/hooks/household/useChildProfiles';
import { toast } from '@/components/ui/use-toast';
import { scheduleEventNotification, cancelEventNotification, initNotificationListeners } from '@/utils/notificationUtils';

export function useCalendarContainer(initialDate?: Date, initialView = 'week') {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || today);
  const [view, setView] = useState<'day' | 'week' | 'month'>(initialView as 'day' | 'week' | 'month');
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isQuickEventDialogOpen, setIsQuickEventDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isMobileEventSheetOpen, setIsMobileEventSheetOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);
  const [eventDefaults, setEventDefaults] = useState<Partial<CalendarFormValues>>({});
  const [quickEventDate, setQuickEventDate] = useState<Date | undefined>();
  const [quickEventTemplate, setQuickEventTemplate] = useState<string | undefined>();
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = useState(true);

  const { 
    events, 
    isLoading, 
    error, 
    refetch,
    manualRefresh,
    isRefreshing
  } = useCalendarEventsData();
  
  const { 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    isLoading: isMutating 
  } = useCalendarEventMutations();

  const { members: householdMembers = [] } = useFamilyMembers();
  const { childProfiles } = useChildProfiles();

  useEffect(() => {
    initNotificationListeners();
  }, []);

  const filteredEvents = events?.filter(event => {
    if (selectedPersonIds.length === 0) return true;
    
    if (event.assigned_to_child && selectedPersonIds.includes(event.assigned_to_child)) {
      return true;
    }
    
    if (event.user_id && selectedPersonIds.includes(event.user_id)) {
      return true;
    }
    
    if (event.is_household_event && selectedPersonIds.length > 0) {
      return true;
    }
    
    return false;
  }) || [];

  return {
    // State
    selectedDate,
    setSelectedDate,
    view,
    setView,
    isEventDialogOpen,
    setIsEventDialogOpen,
    isQuickEventDialogOpen,
    setIsQuickEventDialogOpen,
    isDetailsDialogOpen,
    setIsDetailsDialogOpen,
    isMobileEventSheetOpen,
    setIsMobileEventSheetOpen,
    selectedEvent,
    setSelectedEvent,
    isEditMode,
    setIsEditMode,
    selectedPersonIds,
    setSelectedPersonIds,
    eventDefaults,
    setEventDefaults,
    quickEventDate,
    setQuickEventDate,
    quickEventTemplate,
    setQuickEventTemplate,
    showKeyboardShortcuts,
    setShowKeyboardShortcuts,
    keyboardShortcutsEnabled,
    setKeyboardShortcutsEnabled,
    
    // Data
    events,
    filteredEvents,
    isLoading,
    error,
    isRefreshing,
    isMutating,
    householdMembers,
    childProfiles,
    
    // Mutations
    createEvent,
    updateEvent,
    deleteEvent,
    manualRefresh,
    
    // Constants
    today
  };
}
