import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarTabContent } from './calendar/CalendarTabContent';
import { CalendarEventDialog } from '@/components/calendar/CalendarEventDialog';
import { EventDetailsDialog } from '@/components/calendar/EventDetailsDialog';
import { CalendarFilters } from '@/components/calendar/CalendarFilters';
import { useCalendarEventsData } from '@/hooks/calendar/useCalendarEventsData';
import { useCalendarEventMutations } from '@/hooks/calendar/useCalendarEventMutations';
import { useFamilyMembers } from '@/hooks/household/useFamilyMembers';
import { useChildProfiles } from '@/hooks/household/useChildProfiles';
import { toast } from '@/components/ui/use-toast';
import { CalendarEvent, CalendarFormValues, CalendarViewType } from '@/types/calendar';
import { addDays, format, startOfDay, endOfDay, parseISO, setHours, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { scheduleEventNotification, cancelEventNotification } from '@/utils/notificationUtils';

export function Calendar() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedView, setSelectedView] = useState<CalendarViewType>('month');
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);
  const [eventDefaults, setEventDefaults] = useState<Partial<CalendarFormValues>>({});

  const { events, isLoading, error, refetch } = useCalendarEventsData();
  const { createEvent, updateEvent, deleteEvent, isLoading: isMutating } = useCalendarEventMutations();
  const { members: householdMembers = [] } = useFamilyMembers();
  const { childProfiles = [] } = useChildProfiles();

  // Get days for month view
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Filter events based on selected persons
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
    setSelectedDate(date);
  };

  const handleViewChange = (view: string) => {
    setSelectedView(view as CalendarViewType);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailsDialogOpen(true);
  };

  const handleDayClick = (date: Date) => {
    if (selectedView === 'month') {
      setSelectedDate(date);
      setSelectedView('day');
    } else {
      handleAddEvent(date);
    }
  };

  const handleDateClick = (date: Date) => {
    // For month view, open event dialog instead of navigating
    handleAddEvent(date);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    handleAddEvent(date, hour);
  };

  const handleAddEvent = (date?: Date, hour?: number) => {
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

  const handleSaveEvent = async (eventData: CalendarFormValues) => {
    try {
      if (isEditMode && selectedEvent) {
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
      setEventDefaults({});
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Calendar</CardTitle>
          <button
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            onClick={() => handleAddEvent()}
          >
            + Add Event
          </button>
        </div>
        
        <CalendarFilters
          householdMembers={householdMembers}
          childProfiles={childProfiles}
          selectedPersonIds={selectedPersonIds}
          onPersonToggle={handlePersonToggle}
          onClearFilters={handleClearFilters}
        />
      </CardHeader>

      <div className="flex-1 overflow-hidden">
        <CalendarTabContent
          currentDate={selectedDate}
          days={days}
          events={filteredEvents}
          isLoading={isLoading}
          error={error}
          selectedView={selectedView}
          onViewChange={handleViewChange}
          onEventClick={handleEventClick}
          onDateChange={handleDateChange}
          onDayClick={handleDayClick}
          onDateClick={handleDateClick}
        />
      </div>

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
      
      {selectedEvent && (
        <EventDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          event={selectedEvent}
          onEditClick={handleEditEvent}
          onDeleteClick={handleDeleteEvent}
        />
      )}
    </Card>
  );
}
