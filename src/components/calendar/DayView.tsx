
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, isSameDay, parseISO, differenceInDays } from 'date-fns';
import { CalendarEventCard } from './CalendarEventCard';

interface DayViewProps {
  currentDate: Date;
  events?: CalendarEvent[];
  isLoading?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
}

export function DayView({ currentDate, events = [], isLoading, onEventClick }: DayViewProps) {
  // Filter events for the current day
  const dayEvents = events.filter(event => {
    if (!event) return false;
    const eventStart = parseISO(event.start_date);
    const eventEnd = parseISO(event.end_date);
    return isSameDay(currentDate, eventStart) || 
           isSameDay(currentDate, eventEnd) || 
           (currentDate >= eventStart && currentDate <= eventEnd);
  });

  // Sort events by start time
  const sortedEvents = [...dayEvents].sort((a, b) => {
    return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
  });

  // Add a badge for multi-day events
  const getEventWithDuration = (event: CalendarEvent) => {
    const eventStart = parseISO(event.start_date);
    const eventEnd = parseISO(event.end_date);
    const duration = differenceInDays(eventEnd, eventStart);
    
    return {
      ...event,
      isMultiDay: duration > 0,
      duration: duration + 1 // Include both start and end days
    };
  };

  const eventsWithDuration = sortedEvents.map(getEventWithDuration);

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      console.log('Event clicked in DayView:', event.id);
      onEventClick(event);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h2>
      
      {eventsWithDuration.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No events scheduled for this day
        </div>
      ) : (
        <div className="space-y-3">
          {eventsWithDuration.map(event => (
            <div key={event.id} className="max-w-md mx-auto">
              <CalendarEventCard 
                event={event} 
                showMultiDayBadge={true} 
                onClick={() => handleEventClick(event)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
