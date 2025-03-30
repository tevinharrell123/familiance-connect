
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, isSameDay, parseISO, differenceInDays, addDays, subDays } from 'date-fns';
import { CalendarEventCard } from './CalendarEventCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DayViewProps {
  currentDate: Date;
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateChange?: (date: Date) => void;
}

export function DayView({ currentDate, events = [], onEventClick, onDateChange }: DayViewProps) {
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

  if (eventsWithDuration.length > 0) {
    console.log('Day view events:', eventsWithDuration.length);
  }

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      console.log('Event clicked in DayView:', event.id);
      onEventClick(event);
    }
  };

  const goToPreviousDay = () => {
    if (onDateChange) {
      const previousDay = subDays(currentDate, 1);
      onDateChange(previousDay);
    }
  };

  const goToNextDay = () => {
    if (onDateChange) {
      const nextDay = addDays(currentDate, 1);
      onDateChange(nextDay);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={goToPreviousDay}
          disabled={!onDateChange}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-xl font-semibold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h2>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={goToNextDay}
          disabled={!onDateChange}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
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
                onClick={handleEventClick}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
