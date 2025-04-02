
import React, { useEffect, useState } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, isSameDay, parseISO, isSameMonth } from 'date-fns';
import { getEventsForDay } from './utils/calendarEventUtils';
import { EventIndicator } from './EventIndicator';
import { MonthViewStyles } from './MonthViewStyles';
import { useIsMobile } from '@/hooks/use-mobile';

interface MonthViewProps {
  days: Date[];
  events: CalendarEvent[];
  currentMonth: Date;
  onEventClick: (event: CalendarEvent) => void;
  onDayClick?: (date: Date) => void;
}

export function MonthView({ days, events, currentMonth, onEventClick, onDayClick }: MonthViewProps) {
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

  const handleEventClick = (event: CalendarEvent) => {
    console.log('Event clicked in MonthView:', event.id);
    onEventClick(event);
  };

  const handleDayClick = (day: Date) => {
    if (onDayClick && isSameMonth(day, currentMonth)) {
      console.log('Day clicked:', format(day, 'yyyy-MM-dd'));
      onDayClick(day);
    }
  };

  // Dynamically set max visible events based on screen size and cell height
  let maxVisibleEvents = 5;
  if (windowWidth <= 480) {
    maxVisibleEvents = 1;
  } else if (windowWidth <= 640) {
    maxVisibleEvents = 2;
  } else if (windowWidth <= 768) {
    maxVisibleEvents = 3;
  } else if (windowWidth <= 1024) {
    maxVisibleEvents = 4;
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
          <div key={i} className="text-center py-1 font-medium text-xs sm:text-sm">
            {getDayLabel(day)}
          </div>
        ))}
        
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          
          // Get events for this day
          const dayEvents = getEventsForDay(day, events);
          
          return (
            <div 
              key={i} 
              className={`calendar-day border p-0.5 sm:p-1 ${
                isCurrentMonth ? 'bg-white' : 'text-gray-300 bg-gray-50'
              } ${isToday ? 'border-primary' : ''} ${
                isCurrentMonth ? 'cursor-pointer hover:bg-gray-50' : ''
              }`}
              onClick={() => isCurrentMonth && handleDayClick(day)}
            >
              <div className={`text-xs sm:text-sm ${isToday ? 'font-bold text-primary' : ''}`}>
                {format(day, 'd')}
              </div>
              
              <div className="overflow-y-auto max-h-full day-events-container">
                {dayEvents.length > 0 && dayEvents.slice(0, maxVisibleEvents).map(event => (
                  <EventIndicator 
                    key={event.id} 
                    event={event} 
                    onClick={handleEventClick} 
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <MonthViewStyles />
    </div>
  );
}
