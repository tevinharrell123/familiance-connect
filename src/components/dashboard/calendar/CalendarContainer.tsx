
import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MonthView } from '@/components/calendar/MonthView';
import { WeekView } from '@/components/calendar/WeekView';
import { DayView } from '@/components/calendar/DayView';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarEventDialog } from '@/components/calendar/CalendarEventDialog';
import { EventDetailsDialog } from '@/components/calendar/EventDetailsDialog';
import { useCalendarEventsData } from '@/hooks/calendar/useCalendarEventsData';
import { useCalendarEventMutations } from '@/hooks/calendar/useCalendarEventMutations';
import { toast } from '@/components/ui/use-toast';
import { CalendarEvent, CalendarFormValues } from '@/types/calendar';
import { addDays, format, startOfDay, endOfDay, parseISO } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

export function CalendarWidget({ initialDate, initialView = 'week' }: { initialDate?: Date, initialView?: 'day' | 'week' | 'month' }) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || today);
  const [view, setView] = useState<'day' | 'week' | 'month'>(initialView);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const isMobile = useIsMobile();

  const { 
    events, 
    isLoading, 
    error, 
    refetch 
  } = useCalendarEventsData();
  
  const { 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    isLoading: isMutating 
  } = useCalendarEventMutations();

  // Load calendar data immediately and set up a refresh interval
  useEffect(() => {
    // Initial load
    refetch();
    
    // Set up a refresh interval (every 30 seconds)
    const intervalId = setInterval(() => {
      refetch();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [refetch]);

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

  const handleSaveEvent = async (eventData: CalendarFormValues) => {
    try {
      if (isEditMode && selectedEvent) {
        // Update existing event
        await updateEvent({
          ...selectedEvent,
          title: eventData.title,
          description: eventData.description,
          color: eventData.color,
          start_date: format(eventData.start_date, "yyyy-MM-dd'T'HH:mm:ss"),
          end_date: format(eventData.end_date, "yyyy-MM-dd'T'HH:mm:ss"),
          is_household_event: eventData.is_household_event,
          is_public: eventData.is_public
        });
        
        toast({
          title: "Event updated",
          description: "Your event has been updated successfully."
        });
      } else {
        // Create new event
        await createEvent({
          ...eventData,
          start_date: eventData.start_date || startOfDay(selectedDate),
          end_date: eventData.end_date || endOfDay(selectedDate)
        });
        
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
      <Tabs value={view} onValueChange={(v) => setView(v as 'day' | 'week' | 'month')}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-2 border-b">
          <CalendarHeader
            currentDate={selectedDate}
            onAddEvent={handleAddEvent}
            onDateChange={handleDateChange}
          />
          <div className="mt-2 sm:mt-0 flex space-x-1">
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
              <TabsTrigger value="month" className={isMobile ? "px-3" : ""}>
                {isMobile ? "M" : "Month"}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="day" className="h-full">
          <DayView
            currentDate={selectedDate}
            events={events}
            isLoading={isLoading}
            onEventClick={handleSelectEvent}
          />
        </TabsContent>
        
        <TabsContent value="week" className="h-full">
          <WeekView
            currentDate={selectedDate}
            events={events}
            isLoading={isLoading}
            onEventClick={handleSelectEvent}
          />
        </TabsContent>
        
        <TabsContent value="month" className="h-full flex-1">
          <MonthView
            currentMonth={selectedDate}
            days={[]} // These will be calculated inside the component
            events={events}
            onEventClick={handleSelectEvent}
            onDayClick={handleDateChange}
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
