
import React, { useEffect, useState } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, isSameDay, parseISO, isSameMonth, differenceInDays } from 'date-fns';
import { getEventsForDay, getWeeklyEvents } from './utils/calendarEventUtils';
import { EventIndicator } from './EventIndicator';
import { MultiDayEvent } from './MultiDayEvent';
import { MonthViewStyles } from './MonthViewStyles';
import { useIsMobile } from '@/hooks/use-mobile';

interface MonthViewProps {
  days: Date[];
  events: CalendarEvent[];
  currentMonth: Date;
  onEventClick: (event: CalendarEvent) => void;
}

export function MonthView({ days, events, currentMonth, onEventClick }: MonthViewProps) {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const isMobile = useIsMobile();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Update window width state when resized
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Get weekly events for multi-day rendering
  const weeklyEvents = getWeeklyEvents(days, events);

  const handleEventClick = (event: CalendarEvent) => {
    console.log('Event clicked in MonthView:', event.id);
    onEventClick(event);
  };

  // Filter out multi-day events for day cell rendering to avoid duplicates
  const singleDayEvents = events.filter(event => {
    const eventStart = parseISO(event.start_date);
    const eventEnd = parseISO(event.end_date);
    return differenceInDays(eventEnd, eventStart) === 0;
  });

  // Dynamically set max visible events based on screen size
  let maxVisibleEvents = 3;
  if (windowWidth <= 640) {
    maxVisibleEvents = 1;
  } else if (windowWidth <= 768) {
    maxVisibleEvents = 2;
  }

  // Determine day label format based on screen size
  const getDayLabel = (day: string) => {
    if (windowWidth <= 480) {
      return day.charAt(0);
    } else if (windowWidth <= 640) {
      return day.charAt(0);
    }
    return day;
  };

  return (
    <div className="month-view relative">
      {/* Regular day cells */}
      <div className="calendar-grid grid-container">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center py-2 font-medium text-xs sm:text-sm">
            {getDayLabel(day)}
          </div>
        ))}
        
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          
          // Get single-day events for this day
          const dayEvents = getEventsForDay(day, singleDayEvents);
          
          return (
            <div 
              key={i} 
              className={`calendar-day border ${
                isCurrentMonth ? 'bg-white' : 'text-gray-300 bg-gray-50'
              } ${isToday ? 'border-primary' : ''}`}
            >
              <div className={`text-xs sm:text-sm p-1 ${isToday ? 'font-bold text-primary' : ''}`}>
                {format(day, 'd')}
              </div>
              
              <div className="px-1 overflow-visible day-events-container mt-6">
                {dayEvents.length > 0 && dayEvents.slice(0, maxVisibleEvents).map(event => (
                  <EventIndicator 
                    key={event.id} 
                    event={event} 
                    onClick={handleEventClick} 
                  />
                ))}
                
                {dayEvents.length > maxVisibleEvents && (
                  <div className="text-[10px] text-center text-muted-foreground">
                    +{dayEvents.length - maxVisibleEvents} more
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
            rowPosition={weekEvent.rowPosition || 0}
            onClick={handleEventClick}
          />
        ))}
      </div>
      
      <MonthViewStyles />
    </div>
  );
}
