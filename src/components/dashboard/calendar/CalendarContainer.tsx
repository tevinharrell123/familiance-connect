
import React from 'react';
import { Tabs } from "@/components/ui/tabs";
import { MobileCalendarContainer } from '@/components/calendar/MobileCalendarContainer';
import { CalendarWidgetHeader } from '@/components/calendar/CalendarWidgetHeader';
import { CalendarContent } from '@/components/calendar/CalendarContent';
import { CalendarDialogs } from '@/components/calendar/CalendarDialogs';
import { TouchCalendar } from '@/components/calendar/TouchCalendar';
import { useCalendarContainer } from '@/hooks/calendar/useCalendarContainer';
import { useCalendarHandlers } from '@/hooks/calendar/useCalendarHandlers';
import { useSharedCalendarData } from '@/hooks/calendar/useSharedCalendarData';
import { useIsMobile } from '@/hooks/use-mobile';

export function CalendarWidget({ initialDate, initialView = 'week' }: { initialDate?: Date, initialView?: 'day' | 'week' | 'month' }) {
  const isMobile = useIsMobile();
  
  // Use shared calendar data instead of local state
  const { events, isLoading, refetch, manualRefresh, isRefreshing } = useSharedCalendarData();
  
  const containerState = useCalendarContainer(initialDate, initialView);
  
  // Override container state with shared data
  const enhancedContainerState = {
    ...containerState,
    events,
    isLoading,
    refetch,
    manualRefresh,
    isRefreshing
  };
  
  // Wrap mutation functions to match expected signatures
  const wrappedCreateEvent = async (data: any) => {
    return await containerState.createEvent(data);
  };

  const wrappedUpdateEvent = async (event: any) => {
    containerState.updateEvent(event);
    return event;
  };

  const wrappedDeleteEvent = async (id: string) => {
    containerState.deleteEvent(id);
    return Promise.resolve();
  };

  const wrappedManualRefresh = async () => {
    await manualRefresh();
    return Promise.resolve();
  };
  
  const handlers = useCalendarHandlers({
    selectedDate: containerState.selectedDate,
    setSelectedDate: containerState.setSelectedDate,
    view: containerState.view,
    setView: containerState.setView,
    setSelectedEvent: containerState.setSelectedEvent,
    setIsEditMode: containerState.setIsEditMode,
    setEventDefaults: containerState.setEventDefaults,
    setIsEventDialogOpen: containerState.setIsEventDialogOpen,
    setIsQuickEventDialogOpen: containerState.setIsQuickEventDialogOpen,
    setQuickEventDate: containerState.setQuickEventDate,
    setQuickEventTemplate: containerState.setQuickEventTemplate,
    setIsDetailsDialogOpen: containerState.setIsDetailsDialogOpen,
    setIsMobileEventSheetOpen: containerState.setIsMobileEventSheetOpen,
    setSelectedPersonIds: containerState.setSelectedPersonIds,
    createEvent: wrappedCreateEvent,
    updateEvent: wrappedUpdateEvent,
    deleteEvent: wrappedDeleteEvent,
    manualRefresh: wrappedManualRefresh,
    today: containerState.today
  });

  const handleSaveEvent = (eventData: any) => {
    console.log('CalendarContainer handleSaveEvent called with:', eventData);
    // Add assigned_to field for backward compatibility
    const enhancedEventData = {
      ...eventData,
      assigned_to: eventData.assigned_to_member || eventData.assigned_to_child || eventData.assigned_to
    };
    handlers.handleSaveEvent(enhancedEventData, containerState.selectedEvent, containerState.isEditMode);
  };

  const handleDateClick = (date: Date) => {
    // For month view, open quick event dialog instead of navigating
    if (containerState.view === 'month') {
      handlers.handleQuickEventCreate(date);
    } else {
      handlers.handleDayClick(date);
    }
  };

  const CalendarComponent = (
    <div className="calendar-widget w-full h-full flex flex-col">
      <Tabs value={containerState.view} onValueChange={(v) => containerState.setView(v as 'day' | 'week' | 'month')}>
        <CalendarWidgetHeader
          selectedDate={containerState.selectedDate}
          view={containerState.view}
          onQuickEventCreate={handlers.handleQuickEventCreate}
          onDateChange={handlers.handleDateChange}
          onManualRefresh={handlers.handleManualRefresh}
          isRefreshing={containerState.isRefreshing}
          householdMembers={containerState.householdMembers}
          childProfiles={containerState.childProfiles}
          selectedPersonIds={containerState.selectedPersonIds}
          onPersonToggle={handlers.handlePersonToggle}
          onClearFilters={handlers.handleClearFilters}
          showKeyboardShortcuts={containerState.showKeyboardShortcuts}
          onToggleKeyboardShortcuts={() => containerState.setShowKeyboardShortcuts(!containerState.showKeyboardShortcuts)}
          onKeyboardShortcut={handlers.handleKeyboardShortcut}
          keyboardShortcutsEnabled={containerState.keyboardShortcutsEnabled}
        />

        <CalendarContent
          view={containerState.view}
          selectedDate={containerState.selectedDate}
          filteredEvents={containerState.filteredEvents}
          isLoading={containerState.isLoading}
          onSelectEvent={handlers.handleSelectEvent}
          onDayClick={handleDateClick}
          onTimeSlotClick={handlers.handleTimeSlotClick}
          onQuickEventCreate={handlers.handleQuickEventCreate}
          onEventEdit={handlers.handleEditEvent}
          onEventDelete={handlers.handleDeleteEvent}
          onEventDuplicate={handlers.handleDuplicateEvent}
        />
      </Tabs>

      <CalendarDialogs
        isEventDialogOpen={containerState.isEventDialogOpen}
        setIsEventDialogOpen={containerState.setIsEventDialogOpen}
        isQuickEventDialogOpen={containerState.isQuickEventDialogOpen}
        setIsQuickEventDialogOpen={containerState.setIsQuickEventDialogOpen}
        isDetailsDialogOpen={containerState.isDetailsDialogOpen}
        setIsDetailsDialogOpen={containerState.setIsDetailsDialogOpen}
        isMobileEventSheetOpen={containerState.isMobileEventSheetOpen}
        setIsMobileEventSheetOpen={containerState.setIsMobileEventSheetOpen}
        selectedEvent={containerState.selectedEvent}
        isEditMode={containerState.isEditMode}
        eventDefaults={containerState.eventDefaults}
        quickEventDate={containerState.quickEventDate}
        quickEventTemplate={containerState.quickEventTemplate}
        onSaveEvent={handleSaveEvent}
        onEditEvent={() => handlers.handleEditEvent(containerState.selectedEvent)}
        onDeleteEvent={() => handlers.handleDeleteEvent(containerState.selectedEvent)}
        onKeyboardShortcut={handlers.handleKeyboardShortcut}
        isMutating={containerState.isMutating}
        keyboardShortcutsEnabled={containerState.keyboardShortcutsEnabled}
      />
    </div>
  );

  // Wrap with TouchCalendar for mobile swipe support
  if (isMobile) {
    return (
      <MobileCalendarContainer
        currentDate={containerState.selectedDate}
        view={containerState.view}
        onDateChange={handlers.handleDateChange}
        onRefresh={handlers.handleManualRefresh}
        isRefreshing={containerState.isRefreshing}
      >
        <TouchCalendar
          currentDate={containerState.selectedDate}
          view={containerState.view}
          onDateChange={handlers.handleDateChange}
          className="h-full"
        >
          {CalendarComponent}
        </TouchCalendar>
      </MobileCalendarContainer>
    );
  }

  return (
    <MobileCalendarContainer
      currentDate={containerState.selectedDate}
      view={containerState.view}
      onDateChange={handlers.handleDateChange}
      onRefresh={handlers.handleManualRefresh}
      isRefreshing={containerState.isRefreshing}
    >
      {CalendarComponent}
    </MobileCalendarContainer>
  );
}
