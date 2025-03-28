
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, isSameDay, parseISO, isSameMonth } from 'date-fns';
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
    <div className="month-view">
      <div className="calendar-grid grid-container">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center py-2 font-medium text-sm">
            {day}
          </div>
        ))}
        
        {/* Regular day cells */}
        {days.map((day, i) => {
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
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
              
              {/* Only show single-day events in day cells */}
              <div className="px-1 overflow-hidden">
                {getEventsForDay(day, events)
                  .filter(event => {
                    const eventStart = parseISO(event.start_date);
                    const eventEnd = parseISO(event.end_date);
                    return isSameDay(eventStart, eventEnd); // Only single-day events
                  })
                  .slice(0, 2)
                  .map(event => (
                    <EventIndicator 
                      key={event.id} 
                      event={event} 
                      onClick={onEventClick} 
                    />
                  ))
                }
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Multi-day events rendered on top of the grid */}
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
