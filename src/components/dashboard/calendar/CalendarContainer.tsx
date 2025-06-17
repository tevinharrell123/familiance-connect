
import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { EnhancedWeekView } from '@/components/calendar/EnhancedWeekView';
import { EnhancedDayView } from '@/components/calendar/EnhancedDayView';
import { MonthView } from '@/components/calendar/MonthView';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarEventDialog } from '@/components/calendar/CalendarEventDialog';
import { EventDetailsDialog } from '@/components/calendar/EventDetailsDialog';
import { CalendarFilters } from '@/components/calendar/CalendarFilters';
import { QuickEventDialog } from '@/components/calendar/QuickEventDialog';
import { KeyboardShortcuts } from '@/components/calendar/KeyboardShortcuts';
import { useCalendarEventsData } from '@/hooks/calendar/useCalendarEventsData';
import { useCalendarEventMutations } from '@/hooks/calendar/useCalendarEventMutations';
import { useFamilyMembers } from '@/hooks/household/useFamilyMembers';
import { useChildProfiles } from '@/hooks/household/useChildProfiles';
import { toast } from '@/components/ui/use-toast';
import { CalendarEvent, CalendarFormValues } from '@/types/calendar';
import { addDays, format, startOfDay, endOfDay, parseISO, setHours } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { scheduleEventNotification, cancelEventNotification, initNotificationListeners } from '@/utils/notificationUtils';
import { RefreshCw, Keyboard } from 'lucide-react';

export function CalendarWidget({ initialDate, initialView = 'week' }: { initialDate?: Date, initialView?: 'day' | 'week' | 'month' }) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || today);
  const [view, setView] = useState<'day' | 'week' | 'month'>(initialView as 'day' | 'week' | 'month');
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isQuickEventDialogOpen, setIsQuickEventDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);
  const [eventDefaults, setEventDefaults] = useState<Partial<CalendarFormValues>>({});
  const [quickEventDate, setQuickEventDate] = useState<Date | undefined>();
  const [quickEventTemplate, setQuickEventTemplate] = useState<string | undefined>();
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = useState(true);
  const isMobile = useIsMobile();

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

  const handleDateChange = (date: Date) => {
    console.log('Date changed to:', date);
    setSelectedDate(date);
  };

  const handleAddEvent = (date?: Date, hour?: number) => {
    console.log('Adding event for date:', date, 'hour:', hour);
    setSelectedEvent(null);
    setIsEditMode(false);
    
    if (date) {
      setSelectedDate(date);
      if (hour !== undefined) {
        const startDate = setHours(date, hour);
        const endDate = setHours(date, hour + 1);
        setEventDefaults({
          start_date: startDate,
          end_date: endDate
        });
      } else {
        setEventDefaults({
          start_date: startOfDay(date),
          end_date: endOfDay(date)
        });
      }
    } else {
      setEventDefaults({});
    }
    
    setIsEventDialogOpen(true);
  };

  const handleQuickEventCreate = (date: Date, template?: string) => {
    console.log('Quick event create for:', date, 'template:', template);
    setQuickEventDate(date);
    setQuickEventTemplate(template);
    setIsQuickEventDialogOpen(true);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    handleAddEvent(date, hour);
  };

  const handleDayClick = (date: Date) => {
    console.log('Day clicked:', date, 'Current view:', view);
    if (view === 'month') {
      setSelectedDate(date);
      setView('day');
    } else {
      handleQuickEventCreate(date);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    console.log('Event selected:', event.title);
    setSelectedEvent(event);
    setIsDetailsDialogOpen(true);
  };

  const handleEditEvent = (event?: CalendarEvent) => {
    console.log('Edit event clicked for:', event?.title || selectedEvent?.title);
    const eventToEdit = event || selectedEvent;
    if (eventToEdit) {
      setSelectedEvent(eventToEdit);
      setIsDetailsDialogOpen(false);
      setIsEditMode(true);
      setIsEventDialogOpen(true);
    }
  };

  const handleDeleteEvent = async (event?: CalendarEvent) => {
    const eventToDelete = event || selectedEvent;
    if (!eventToDelete) return;
    
    console.log('Deleting event:', eventToDelete.id);
    try {
      await cancelEventNotification(eventToDelete.id);
      await deleteEvent(eventToDelete.id);
      setIsDetailsDialogOpen(false);
      toast({
        title: "Event deleted",
        description: "The event has been removed from your calendar."
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "There was a problem deleting the event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDuplicateEvent = async (event: CalendarEvent) => {
    console.log('Duplicating event:', event.title);
    try {
      const duplicatedEvent: CalendarFormValues = {
        title: `${event.title} (Copy)`,
        description: event.description || '',
        start_date: parseISO(event.start_date),
        end_date: parseISO(event.end_date),
        color: event.color || '#7B68EE',
        is_household_event: event.is_household_event,
        is_public: event.is_public,
        category: event.category || 'Other'
      };
      
      await createEvent(duplicatedEvent);
      toast({
        title: "Event duplicated",
        description: "A copy of the event has been created."
      });
    } catch (error) {
      console.error("Error duplicating event:", error);
      toast({
        title: "Error",
        description: "There was a problem duplicating the event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePersonToggle = (personId: string) => {
    setSelectedPersonIds(prev => 
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const handleClearFilters = () => {
    setSelectedPersonIds([]);
  };

  const handleManualRefresh = async () => {
    try {
      await manualRefresh();
      toast({
        title: "Calendar refreshed",
        description: "Events have been updated with the latest data."
      });
    } catch (error) {
      console.error("Manual refresh failed:", error);
    }
  };

  const handleKeyboardShortcut = (action: string) => {
    console.log('Keyboard shortcut:', action);
    switch (action) {
      case 'new-event':
        handleQuickEventCreate(selectedDate);
        break;
      case 'today':
        setSelectedDate(today);
        break;
      case 'day-view':
        setView('day');
        break;
      case 'week-view':
        setView('week');
        break;
      case 'month-view':
        setView('month');
        break;
      case 'prev':
        if (view === 'month') {
          setSelectedDate(addDays(selectedDate, -30));
        } else if (view === 'week') {
          setSelectedDate(addDays(selectedDate, -7));
        } else {
          setSelectedDate(addDays(selectedDate, -1));
        }
        break;
      case 'next':
        if (view === 'month') {
          setSelectedDate(addDays(selectedDate, 30));
        } else if (view === 'week') {
          setSelectedDate(addDays(selectedDate, 7));
        } else {
          setSelectedDate(addDays(selectedDate, 1));
        }
        break;
      case 'refresh':
        handleManualRefresh();
        break;
      case 'close':
        setIsEventDialogOpen(false);
        setIsQuickEventDialogOpen(false);
        setIsDetailsDialogOpen(false);
        setShowKeyboardShortcuts(false);
        break;
    }
  };

  const handleSaveEvent = async (eventData: CalendarFormValues) => {
    console.log('Saving event:', eventData);
    try {
      if (isEditMode && selectedEvent) {
        console.log('Updating existing event:', selectedEvent.id);
        const updatedEvent = {
          ...selectedEvent,
          title: eventData.title,
          description: eventData.description,
          color: eventData.color,
          start_date: format(eventData.start_date, "yyyy-MM-dd'T'HH:mm:ss"),
          end_date: format(eventData.end_date, "yyyy-MM-dd'T'HH:mm:ss"),
          is_household_event: eventData.is_household_event,
          is_public: eventData.is_public
        };
        
        await updateEvent(updatedEvent);
        
        await cancelEventNotification(selectedEvent.id);
        await scheduleEventNotification(updatedEvent);
        
        toast({
          title: "Event updated",
          description: "Your event has been updated successfully."
        });
      } else {
        console.log('Creating new event');
        const newEventData = {
          ...eventData,
          start_date: eventData.start_date || startOfDay(selectedDate),
          end_date: eventData.end_date || endOfDay(selectedDate)
        };
        
        const createdEvent = await createEvent(newEventData);
        
        if (createdEvent && typeof createdEvent === 'object' && 'id' in createdEvent) {
          await scheduleEventNotification(createdEvent);
        }
        
        toast({
          title: "Event created",
          description: "Your new event has been added to the calendar."
        });
      }

      setIsEventDialogOpen(false);
      setIsQuickEventDialogOpen(false);
      setEventDefaults({});
      setQuickEventDate(undefined);
      setQuickEventTemplate(undefined);
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your event. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="calendar-widget w-full h-full flex flex-col">
      <Tabs value={view} onValueChange={(v) => setView(v as 'day' | 'week' | 'month')}>
        <div className="flex flex-col space-y-2 px-4 py-2 border-b bg-background">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <CalendarHeader
              currentDate={selectedDate}
              onAddEvent={() => handleQuickEventCreate(selectedDate)}
              onDateChange={handleDateChange}
            />
            <div className="mt-2 sm:mt-0 flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isMobile ? '' : 'Refresh'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                className="flex items-center gap-2"
              >
                <Keyboard className="h-4 w-4" />
                {isMobile ? '' : 'Shortcuts'}
              </Button>
              <button
                className="p-2 rounded-md text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleQuickEventCreate(selectedDate)}
              >
                + Event
              </button>
              <TabsList>
                <TabsTrigger value="month" className={isMobile ? "px-3" : ""}>
                  {isMobile ? "M" : "Month"}
                </TabsTrigger>
                <TabsTrigger value="week" className={isMobile ? "px-3" : ""}>
                  {isMobile ? "W" : "Week"}
                </TabsTrigger>
                <TabsTrigger value="day" className={isMobile ? "px-3" : ""}>
                  {isMobile ? "D" : "Day"}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <CalendarFilters
            householdMembers={householdMembers || []}
            childProfiles={childProfiles || []}
            selectedPersonIds={selectedPersonIds}
            onPersonToggle={handlePersonToggle}
            onClearFilters={handleClearFilters}
          />

          {showKeyboardShortcuts && (
            <div className="flex justify-center">
              <KeyboardShortcuts
                onQuickAction={handleKeyboardShortcut}
                isEnabled={keyboardShortcutsEnabled}
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="month" className="h-full m-0 p-4">
            <MonthView
              currentDate={selectedDate}
              events={filteredEvents}
              onEventClick={handleSelectEvent}
              onDayClick={handleDayClick}
              onQuickEventCreate={handleQuickEventCreate}
              onEventEdit={handleEditEvent}
              onEventDelete={handleDeleteEvent}
              onEventDuplicate={handleDuplicateEvent}
            />
          </TabsContent>
          
          <TabsContent value="week" className="h-full m-0">
            <EnhancedWeekView
              currentDate={selectedDate}
              events={filteredEvents}
              isLoading={isLoading}
              onEventClick={handleSelectEvent}
              onTimeSlotClick={handleTimeSlotClick}
            />
          </TabsContent>
          
          <TabsContent value="day" className="h-full m-0">
            <EnhancedDayView
              currentDate={selectedDate}
              events={filteredEvents}
              isLoading={isLoading}
              onEventClick={handleSelectEvent}
              onTimeSlotClick={handleTimeSlotClick}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Keyboard shortcuts handler */}
      <KeyboardShortcuts
        onQuickAction={handleKeyboardShortcut}
        isEnabled={keyboardShortcutsEnabled && !isEventDialogOpen && !isQuickEventDialogOpen && !isDetailsDialogOpen}
      />

      <CalendarEventDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        onSubmit={handleSaveEvent}
        isEditing={isEditMode}
        defaultValues={isEditMode && selectedEvent ? {
          title: selectedEvent.title,
          description: selectedEvent.description || '',
          start_date: parseISO(selectedEvent.start_date),
          end_date: parseISO(selectedEvent.end_date),
          color: selectedEvent.color || '',
          is_household_event: selectedEvent.is_household_event,
          is_public: selectedEvent.is_public
        } : eventDefaults}
        isSubmitting={isMutating}
      />

      <QuickEventDialog
        open={isQuickEventDialogOpen}
        onOpenChange={setIsQuickEventDialogOpen}
        onSubmit={handleSaveEvent}
        selectedDate={quickEventDate}
        selectedTemplate={quickEventTemplate}
      />
      
      {selectedEvent && (
        <EventDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          event={selectedEvent}
          onEditClick={() => handleEditEvent()}
          onDeleteClick={() => handleDeleteEvent()}
        />
      )}
    </div>
  );
}
