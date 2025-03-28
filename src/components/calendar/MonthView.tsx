
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, isSameDay, parseISO, isSameMonth, differenceInDays } from 'date-fns';
import { getEventsForDay, getWeeklyEvents } from './utils/calendarEventUtils';
import { EventIndicator } from './EventIndicator';
import { MultiDayEvent } from './MultiDayEvent';
import { MonthViewStyles } from './MonthViewStyles';

interface MonthViewProps {
  days: Date[];
  events: CalendarEvent[];
  currentMonth: Date;
  onEventClick: (event: CalendarEvent) => void;
}

export function MonthView({ days, events, currentMonth, onEventClick }: MonthViewProps) {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Get weekly events for multi-day rendering
  const weeklyEvents = getWeeklyEvents(days, events);

  return (
    <div className="month-view relative">
      <div className="calendar-grid grid-container">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center py-2 font-medium text-sm">
            {day}
          </div>
        ))}
        
        {/* Regular day cells */}
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          
          // Get single-day events
          const dayEvents = getEventsForDay(day, events)
            .filter(event => {
              const eventStart = parseISO(event.start_date);
              const eventEnd = parseISO(event.end_date);
              return differenceInDays(eventEnd, eventStart) === 0; // Only single-day events
            });
          
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
              
              {/* Only show single-day events in day cells */}
              <div className="px-1 overflow-hidden mt-6">
                {dayEvents.slice(0, 2).map(event => (
                  <EventIndicator 
                    key={event.id} 
                    event={event} 
                    onClick={onEventClick} 
                  />
                ))}
                
                {dayEvents.length > 2 && (
                  <div className="text-xs text-center text-muted-foreground">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Overlay container for multi-day events */}
      <div className="multi-day-events-container">
        {weeklyEvents.map((weekEvent, idx) => (
          <MultiDayEvent 
            key={`${weekEvent.event.id}-${idx}`}
            event={weekEvent.event}
            startIdx={weekEvent.startIdx}
            endIdx={weekEvent.endIdx}
            weekIdx={weekEvent.weekIdx}
            onClick={onEventClick}
          />
        ))}
      </div>
      
      <MonthViewStyles />
    </div>
  );
}
