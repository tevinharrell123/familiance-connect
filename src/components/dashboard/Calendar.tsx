import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { CalendarEventDialog } from '@/components/calendar/CalendarEventDialog';
import { CalendarFormValues, CalendarEvent, CalendarViewType } from '@/types/calendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';
import { MonthView } from '@/components/calendar/MonthView';
import { WeekView } from '@/components/calendar/WeekView';
import { DayView } from '@/components/calendar/DayView';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { toast } from '@/components/ui/use-toast';

export function CalendarWidget() {
  const { user, household } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<CalendarViewType>('month');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

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

  useEffect(() => {
    console.log('Fetching calendar events on mount');
    refetch();
  }, []);

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
        refetch();
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
        refetch();
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
        refetch();
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

  if (events && events.length > 0) {
    console.log('Calendar events available:', events.length);
  }

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
      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{format(currentDate, 'MMMM yyyy')}</h3>
          <Tabs defaultValue="month" value={selectedView} onValueChange={(v) => setSelectedView(v as CalendarViewType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
            </TabsList>
            
            <TabsContent value="month" className="mt-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-[300px] w-full" />
                </div>
              ) : error ? (
                <div className="text-center p-4 text-red-500 flex flex-col items-center">
                  <AlertTriangle className="h-8 w-8 mb-2" />
                  <p>Error loading calendar events</p>
                </div>
              ) : (
                <>
                  <MonthView 
                    days={days} 
                    events={events} 
                    currentMonth={currentDate} 
                    onEventClick={handleEventClick} 
                  />
                  
                  <style>
                    {`
                    .calendar-grid {
                      display: grid;
                      grid-template-columns: repeat(7, 1fr);
                      position: relative;
                    }
                    
                    .calendar-day {
                      min-height: 80px;
                      display: flex;
                      flex-direction: column;
                      position: relative;
                      z-index: 1;
                    }
                    
                    @media (max-width: 640px) {
                      .calendar-day {
                        min-height: 60px;
                      }
                    }
                  `}
                  </style>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="day">
              <DayView currentDate={currentDate} events={events} />
            </TabsContent>
            
            <TabsContent value="week">
              <WeekView currentDate={currentDate} events={events} />
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      
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
    </Card>
  );
}
