import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { CalendarEventDialog } from '@/components/calendar/CalendarEventDialog';
import { CalendarFormValues, CalendarEvent, CalendarViewType } from '@/types/calendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays, isSameDay, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';

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
  } = useCalendarEvents();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDay = monthStart.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const daysFromPreviousMonth = startDay === 0 ? 0 : startDay;
  const daysFromNextMonth = 42 - (days.length + daysFromPreviousMonth); // 42 = 6 rows of 7 days
  
  const previousMonthDays = Array.from({ length: daysFromPreviousMonth }, (_, i) => 
    addDays(monthStart, -(daysFromPreviousMonth - i))
  );
  
  const nextMonthDays = Array.from({ length: daysFromNextMonth }, (_, i) => 
    addDays(monthEnd, i + 1)
  );
  
  const calendarDays = [...previousMonthDays, ...days, ...nextMonthDays];
  
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getEventsForDay = (day: Date): CalendarEvent[] => {
    if (!events) return [];
    
    return events.filter(event => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      
      return day >= eventStart && day <= eventEnd;
    });
  };

  const handleCreateEvent = (values: CalendarFormValues) => {
    createEvent(values);
    setDialogOpen(false);
  };

  const handleUpdateEvent = (values: CalendarFormValues) => {
    if (!editingEvent) return;
    
    updateEvent({
      ...editingEvent,
      title: values.title,
      description: values.description || null,
      start_date: values.start_date.toISOString(),
      end_date: values.end_date.toISOString(),
      color: values.color || null,
      is_household_event: values.is_household_event
    });
    
    setEditingEvent(null);
    setDialogOpen(false);
  };

  const handleDeleteEvent = () => {
    if (!editingEvent) return;
    
    deleteEvent(editingEvent);
    setEditingEvent(null);
    setDialogOpen(false);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const getEventDialogDefaultValues = (): Partial<CalendarFormValues> => {
    if (!editingEvent) return {};
    
    return {
      title: editingEvent.title,
      description: editingEvent.description || '',
      start_date: parseISO(editingEvent.start_date),
      end_date: parseISO(editingEvent.end_date),
      color: editingEvent.color || '#7B68EE',
      is_household_event: editingEvent.is_household_event
    };
  };

  const renderEventIndicator = (event: CalendarEvent) => {
    const userInitials = event.user_profile?.full_name
      ? event.user_profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : '?';
      
    return (
      <div 
        key={event.id} 
        className="flex items-center text-xs rounded-full px-1 mt-1 truncate"
        style={{ backgroundColor: `${event.color || '#7B68EE'}30` }}
      >
        <Avatar className="h-4 w-4 mr-1">
          {event.user_profile?.avatar_url ? (
            <AvatarImage src={event.user_profile.avatar_url} alt={event.user_profile.full_name || ''} />
          ) : null}
          <AvatarFallback className="text-[8px]">{userInitials}</AvatarFallback>
        </Avatar>
        <span className="truncate">{event.title}</span>
      </div>
    );
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <CardTitle>Family Calendar</CardTitle>
        </div>
        <Button size="sm" className="bg-primary" onClick={() => {
          setEditingEvent(null);
          setDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-1" /> Add Event
        </Button>
      </CardHeader>
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
                  <div className="calendar-grid">
                    {weekDays.map((day, i) => (
                      <div key={i} className="text-center py-2 font-medium text-sm">
                        {day}
                      </div>
                    ))}
                    
                    {calendarDays.map((day, i) => {
                      const dayEvents = getEventsForDay(day);
                      const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                      const isToday = isSameDay(day, new Date());
                      
                      return (
                        <div 
                          key={i} 
                          className={`calendar-day border ${
                            isCurrentMonth ? 'bg-white' : 'text-gray-300 bg-gray-50'
                          } ${isToday ? 'border-primary' : ''}`}
                        >
                          <div className={`text-sm p-1 ${isToday ? 'font-bold text-primary' : ''}`}>
                            {format(day, 'd')}
                          </div>
                          
                          <div className="px-1 overflow-hidden">
                            {dayEvents.slice(0, 2).map(event => renderEventIndicator(event))}
                            
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-center mt-1 text-muted-foreground">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <style jsx>{`
                    .calendar-grid {
                      display: grid;
                      grid-template-columns: repeat(7, 1fr);
                    }
                    
                    .calendar-day {
                      min-height: 80px;
                      display: flex;
                      flex-direction: column;
                    }
                    
                    @media (max-width: 640px) {
                      .calendar-day {
                        min-height: 60px;
                      }
                    }
                  `}</style>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="day">
              <div className="p-4 text-center">
                <p>Day view will be implemented in a future update.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="week">
              <div className="p-4 text-center">
                <p>Week view will be implemented in a future update.</p>
              </div>
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
