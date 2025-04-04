
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, differenceInDays } from 'date-fns';
import { CalendarEventCard } from './CalendarEventCard';

interface WeekViewProps {
  currentDate: Date;
  events?: CalendarEvent[];
  isLoading?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
}

export function WeekView({ currentDate, events = [], isLoading, onEventClick }: WeekViewProps) {
  // Get start and end of the week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // 0 = Sunday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  
  // Get all days in the week
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Get events for each day of the week
  const getEventsForDay = (day: Date) => {
    if (!events || events.length === 0) return [];
    
    return events.filter(event => {
      if (!event) return false;
      
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      return isSameDay(day, eventStart) || 
             isSameDay(day, eventEnd) || 
             (day >= eventStart && day <= eventEnd);
    }).map(event => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      const duration = differenceInDays(eventEnd, eventStart);
      
      return {
        ...event,
        isMultiDay: duration > 0,
        duration: duration + 1 // Include both start and end days
      };
    });
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      console.log('Event clicked in WeekView:', event.id);
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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center mb-4">
        {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
      </h2>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
        {weekDays.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          
          return (
            <div key={index} className="border rounded-md overflow-hidden">
              <div className="bg-muted p-2 text-center font-medium">
                <div>{format(day, 'EEE')}</div>
                <div className={`text-lg ${isSameDay(day, new Date()) ? 'text-primary font-bold' : ''}`}>
                  {format(day, 'd')}
                </div>
              </div>
              
              <div className="p-1.5 space-y-1.5 min-h-[140px] max-h-[340px] overflow-y-auto">
                {dayEvents.length === 0 ? (
                  <div className="text-center text-xs text-muted-foreground py-2">No events</div>
                ) : (
                  dayEvents.map(event => (
                    <div key={event.id} className="text-xs mb-1.5">
                      <div
                        className="py-1.5 px-2 rounded cursor-pointer text-xs break-words"
                        style={{ 
                          backgroundColor: `${event.color || '#7B68EE'}30`,
                          borderLeft: `3px solid ${event.color || '#7B68EE'}`
                        }}
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="font-medium">{event.title}</div>
                        {event.isMultiDay && (
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {event.duration} days
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
