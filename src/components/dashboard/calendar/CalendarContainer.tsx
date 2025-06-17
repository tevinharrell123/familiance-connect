
import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { WeekView } from '@/components/calendar/WeekView';
import { DayView } from '@/components/calendar/DayView';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarEventDialog } from '@/components/calendar/CalendarEventDialog';
import { EventDetailsDialog } from '@/components/calendar/EventDetailsDialog';
import { CalendarFilters } from '@/components/calendar/CalendarFilters';
import { useCalendarEventsData } from '@/hooks/calendar/useCalendarEventsData';
import { useCalendarEventMutations } from '@/hooks/calendar/useCalendarEventMutations';
import { useFamilyMembers } from '@/hooks/household/useFamilyMembers';
import { useChildProfiles } from '@/hooks/household/useChildProfiles';
import { toast } from '@/components/ui/use-toast';
import { CalendarEvent, CalendarFormValues } from '@/types/calendar';
import { addDays, format, startOfDay, endOfDay, parseISO } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { scheduleEventNotification, cancelEventNotification, initNotificationListeners } from '@/utils/notificationUtils';
import { RefreshCw } from 'lucide-react';

export function CalendarWidget({ initialDate, initialView = 'week' }: { initialDate?: Date, initialView?: 'day' | 'week' }) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || today);
  const [view, setView] = useState<'day' | 'week'>(initialView as 'day' | 'week');
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);
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

  // Initialize notification listeners
  useEffect(() => {
    initNotificationListeners();
  }, []);

  // Load calendar data immediately (removed the refresh interval since it's now handled in the hook)
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Filter events based on selected persons
  const filteredEvents = events?.filter(event => {
    if (selectedPersonIds.length === 0) return true;
    
    // Check if event is assigned to any of the selected persons
    if (event.assigned_to_child && selectedPersonIds.includes(event.assigned_to_child)) {
      return true;
    }
    
    // Check if event creator is in selected persons (for user events)
    if (event.user_id && selectedPersonIds.includes(event.user_id)) {
      return true;
    }
    
    // For household events, show if any person is selected (since they affect everyone)
    if (event.is_household_event && selectedPersonIds.length > 0) {
      return true;
    }
    
    return false;
  }) || [];

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddEvent = (date?: Date) => {
    setSelectedEvent(null);
    setIsEditMode(false);
    if (date) {
      setSelectedDate(date);
    }
    setIsEventDialogOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailsDialogOpen(true);
  };

  const handleEditEvent = () => {
    setIsDetailsDialogOpen(false);
    setIsEditMode(true);
    setIsEventDialogOpen(true);
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

  const handleSaveEvent = async (eventData: CalendarFormValues) => {
    try {
      if (isEditMode && selectedEvent) {
        // Update existing event
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
        
        // Update the notification for the event
        await cancelEventNotification(selectedEvent.id);
        await scheduleEventNotification(updatedEvent);
        
        toast({
          title: "Event updated",
          description: "Your event has been updated successfully."
        });
      } else {
        // Create new event
        const newEventData = {
          ...eventData,
          start_date: eventData.start_date || startOfDay(selectedDate),
          end_date: eventData.end_date || endOfDay(selectedDate)
        };
        
        const createdEvent = await createEvent(newEventData);
        
        if (createdEvent && typeof createdEvent === 'object' && 'id' in createdEvent) {
          // Schedule notification for the new event
          await scheduleEventNotification(createdEvent);
        }
        
        toast({
          title: "Event created",
          description: "Your new event has been added to the calendar."
        });
      }

      setIsEventDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      // Cancel any scheduled notifications
      await cancelEventNotification(selectedEvent.id);
      
      await deleteEvent(selectedEvent.id);
      setIsDetailsDialogOpen(false);
      refetch();
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

  return (
    <div className="calendar-widget w-full h-full">
      <Tabs value={view} onValueChange={(v) => setView(v as 'day' | 'week')}>
        <div className="flex flex-col space-y-2 px-4 py-2 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <CalendarHeader
              currentDate={selectedDate}
              onAddEvent={handleAddEvent}
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
              <button
                className="p-2 rounded-md text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleAddEvent()}
              >
                + Event
              </button>
              <TabsList>
                <TabsTrigger value="day" className={isMobile ? "px-3" : ""}>
                  {isMobile ? "D" : "Day"}
                </TabsTrigger>
                <TabsTrigger value="week" className={isMobile ? "px-3" : ""}>
                  {isMobile ? "W" : "Week"}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <CalendarFilters
            householdMembers={householdMembers}
            childProfiles={childProfiles}
            selectedPersonIds={selectedPersonIds}
            onPersonToggle={handlePersonToggle}
            onClearFilters={handleClearFilters}
          />
        </div>

        <TabsContent value="day" className="h-full">
          <DayView
            currentDate={selectedDate}
            events={filteredEvents}
            isLoading={isLoading}
            onEventClick={handleSelectEvent}
          />
        </TabsContent>
        
        <TabsContent value="week" className="h-full">
          <WeekView
            currentDate={selectedDate}
            events={filteredEvents}
            isLoading={isLoading}
            onEventClick={handleSelectEvent}
          />
        </TabsContent>
      </Tabs>

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
        } : undefined}
        isSubmitting={isMutating}
      />
      
      {selectedEvent && (
        <EventDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          event={selectedEvent}
          onEditClick={handleEditEvent}
          onDeleteClick={handleDeleteEvent}
        />
      )}
    </div>
  );
}
