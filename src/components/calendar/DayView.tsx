
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, isSameDay, parseISO } from 'date-fns';
import { CalendarEventCard } from './CalendarEventCard';

interface DayViewProps {
  currentDate: Date;
  events?: CalendarEvent[];
}

export function DayView({ currentDate, events = [] }: DayViewProps) {
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

  if (sortedEvents.length > 0) {
    console.log('Day view events:', sortedEvents.length);
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h2>
      
      {sortedEvents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No events scheduled for this day
        </div>
      ) : (
        <div className="space-y-3">
          {sortedEvents.map(event => (
            <div key={event.id} className="max-w-md mx-auto">
              <CalendarEventCard event={event} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
