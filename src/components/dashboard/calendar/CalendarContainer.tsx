
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { CalendarEventDialog } from '@/components/calendar/CalendarEventDialog';
import { EventDetailsDialog } from '@/components/calendar/EventDetailsDialog';
import { CalendarEvent, CalendarFormValues, CalendarViewType } from '@/types/calendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarTabContent } from './CalendarTabContent';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<CalendarViewType>('month');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const { household } = useAuth();
  
  // Add a ref to prevent too frequent refreshes
  const lastRefreshTimeRef = useRef<number>(0);
  const isRefreshingRef = useRef<boolean>(false);
  const initialLoadRef = useRef<boolean>(false);
  
  const { 
    events, 
    isLoading, 
    error,
    createEvent, 
    updateEvent, 
    deleteEvent,
    isCreating,
    isUpdating,
    isDeleting,
    refetch
  } = useCalendarEvents();

  // Refresh function to update calendar events
  const refreshData = useCallback(async () => {
    // Don't refresh if we're already refreshing
    if (isRefreshingRef.current) {
      console.log('Skipping refresh - already in progress');
      return;
    }
    
    // Throttle refreshes to prevent loops
    const now = Date.now();
    if (now - lastRefreshTimeRef.current < 10000) { // 10 seconds minimum between refreshes
      console.log('Skipping refresh - too soon after last refresh');
      return;
    }
    
    console.log('Refreshing calendar events');
    lastRefreshTimeRef.current = now;
    isRefreshingRef.current = true;
    
    try {
      return await refetch();
    } catch (err) {
      console.error('Error refreshing calendar events:', err);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [refetch]);

  // Initial data fetch on mount - do this only once
  useEffect(() => {
    if (!initialLoadRef.current) {
      console.log('Fetching calendar events on mount');
      refreshData();
      initialLoadRef.current = true;
    }
  }, [refreshData]);

  // Refetch events when household changes - but only once per household change
  const householdIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (household && household.id !== householdIdRef.current) {
      console.log('Household changed, refetching calendar events');
      householdIdRef.current = household.id;
      // Wait a tick to avoid potential race conditions
      setTimeout(() => {
        refreshData();
      }, 100);
    }
  }, [household?.id, refreshData]);

  // Calculate dates for different views
  const calculateDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    const firstDay = startOfWeek(monthStart, { weekStartsOn: 0 });
    const lastDay = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: firstDay, end: lastDay });
  };
  
  const days = calculateDays();

  const handleCreateEvent = (values: CalendarFormValues) => {
    console.log('Creating event:', values);
    createEvent(values, {
      onSuccess: () => {
        console.log('Event created successfully, refreshing data');
        // Wait a tick to avoid potential race conditions
        setTimeout(() => {
          refreshData();
        }, 100);
        setDialogOpen(false);
        toast({
          title: "Event created",
          description: "Your event has been successfully created"
        });
      }
    });
  };

  const handleUpdateEvent = (values: CalendarFormValues) => {
    if (!editingEvent) return;
    
    console.log('Updating event:', values);
    updateEvent({
      ...editingEvent,
      title: values.title,
      description: values.description || null,
      start_date: values.start_date.toISOString(),
      end_date: values.end_date.toISOString(),
      color: values.color || null,
      is_household_event: values.is_household_event
    }, {
      onSuccess: () => {
        console.log('Event updated successfully, refreshing data');
        // Wait a tick to avoid potential race conditions
        setTimeout(() => {
          refreshData();
        }, 100);
        setEditingEvent(null);
        setDialogOpen(false);
        toast({
          title: "Event updated",
          description: "Your event has been successfully updated"
        });
      }
    });
  };

  const handleDeleteEvent = () => {
    if (!editingEvent) return;
    
    console.log('Deleting event:', editingEvent);
    deleteEvent(editingEvent, {
      onSuccess: () => {
        console.log('Event deleted successfully, refreshing data');
        // Wait a tick to avoid potential race conditions
        setTimeout(() => {
          refreshData();
        }, 100);
        setEditingEvent(null);
        setDialogOpen(false);
        toast({
          title: "Event deleted",
          description: "Your event has been successfully deleted"
        });
      }
    });
  };

  const handleEventClick = (event: CalendarEvent) => {
    console.log('Event clicked:', event);
    setSelectedEvent(event);
    setDetailsDialogOpen(true);
  };
  
  const handleEditClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };
  
  const handleDayClick = (day: Date) => {
    console.log('Day clicked:', format(day, 'yyyy-MM-dd'));
    setSelectedDay(day);
    setEditingEvent(null);
    setDialogOpen(true);
  };

  const getEventDialogDefaultValues = (): Partial<CalendarFormValues> => {
    if (editingEvent) {
      return {
        title: editingEvent.title,
        description: editingEvent.description || '',
        start_date: new Date(editingEvent.start_date),
        end_date: new Date(editingEvent.end_date),
        color: editingEvent.color || '#7B68EE',
        is_household_event: editingEvent.is_household_event
      };
    }
    
    if (selectedDay) {
      // Initialize with the selected day
      const startDate = new Date(selectedDay);
      const endDate = new Date(selectedDay);
      return {
        title: '',
        description: '',
        start_date: startDate,
        end_date: endDate,
        color: '#7B68EE',
        is_household_event: false
      };
    }
    
    return {};
  };

  return (
    <Card className="shadow-sm">
      <CalendarHeader 
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onAddEvent={() => {
          setEditingEvent(null);
          setSelectedDay(null);
          setDialogOpen(true);
        }}
      />
      
      <CalendarTabContent 
        currentDate={currentDate}
        days={days}
        events={events}
        isLoading={isLoading}
        error={error}
        selectedView={selectedView}
        onViewChange={(view) => setSelectedView(view as CalendarViewType)}
        onEventClick={handleEventClick}
        onDateChange={setCurrentDate}
        onDayClick={handleDayClick}
      />
      
      <CalendarEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
        onDelete={editingEvent ? handleDeleteEvent : undefined}
        isEditing={!!editingEvent}
        defaultValues={getEventDialogDefaultValues()}
        isSubmitting={isCreating || isUpdating}
        isDeleting={isDeleting}
      />
      
      <EventDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        event={selectedEvent}
        onEditClick={handleEditClick}
      />
    </Card>
  );
}
