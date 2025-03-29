
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  const { household, refreshHousehold } = useAuth();

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

  // Refresh function to update both household data and calendar events
  const refreshData = useCallback(async () => {
    console.log('Refreshing all data - household and calendar events');
    if (household) {
      await refreshHousehold();
    }
    return refetch();
  }, [household, refreshHousehold, refetch]);

  useEffect(() => {
    console.log('Fetching calendar events on mount');
    refreshData();
  }, []);

  // Refetch events when household changes or refreshes
  useEffect(() => {
    if (household) {
      console.log('Household updated, refetching calendar events');
      refetch();
    }
  }, [household?.id]);

  // Calculate dates for different views
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  const firstDay = startOfWeek(monthStart, { weekStartsOn: 0 });
  const lastDay = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });
  
  const handleCreateEvent = (values: CalendarFormValues) => {
    console.log('Creating event:', values);
    createEvent(values, {
      onSuccess: () => {
        console.log('Event created successfully, refetching');
        refreshData();
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
        console.log('Event updated successfully, refetching');
        refreshData();
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
        console.log('Event deleted successfully, refetching');
        refreshData();
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

  const getEventDialogDefaultValues = (): Partial<CalendarFormValues> => {
    if (!editingEvent) return {};
    
    return {
      title: editingEvent.title,
      description: editingEvent.description || '',
      start_date: new Date(editingEvent.start_date),
      end_date: new Date(editingEvent.end_date),
      color: editingEvent.color || '#7B68EE',
      is_household_event: editingEvent.is_household_event
    };
  };

  return (
    <Card className="shadow-sm">
      <CalendarHeader 
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onAddEvent={() => {
          setEditingEvent(null);
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
