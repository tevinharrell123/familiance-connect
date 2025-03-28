
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { CalendarEventCard } from './CalendarEventCard';

interface WeekViewProps {
  currentDate: Date;
  events?: CalendarEvent[];
}

export function WeekView({ currentDate, events = [] }: WeekViewProps) {
  // Get start and end of the week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // 0 = Sunday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  
  // Get all days in the week
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Get events for each day of the week
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      return isSameDay(day, eventStart) || 
             isSameDay(day, eventEnd) || 
             (day >= eventStart && day <= eventEnd);
    });
  };

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
              
              <div className="p-2 space-y-2 min-h-[100px] max-h-[300px] overflow-y-auto">
                {dayEvents.length === 0 ? (
                  <div className="text-center text-xs text-muted-foreground py-2">No events</div>
                ) : (
                  dayEvents.map(event => (
                    <div key={event.id} className="text-xs">
                      <CalendarEventCard event={event} />
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
