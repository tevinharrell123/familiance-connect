
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
  // Increased number of visible events to show more at once
  let maxVisibleEvents = 6;
  if (windowWidth <= 480) {
    maxVisibleEvents = 3;
  } else if (windowWidth <= 640) {
    maxVisibleEvents = 4;
  } else if (windowWidth <= 768) {
    maxVisibleEvents = 5;
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
          
          // Determine if we should show more events indicator
          const hasMoreEvents = dayEvents.length > maxVisibleEvents;
          const visibleEvents = hasMoreEvents 
            ? dayEvents.slice(0, maxVisibleEvents - 1) 
            : dayEvents;
          
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
              <div className={`text-xs sm:text-sm font-medium ${isToday ? 'font-bold text-primary' : ''}`}>
                {format(day, 'd')}
              </div>
              
              <div className="overflow-y-auto max-h-full day-events-container">
                {visibleEvents.map(event => (
                  <EventIndicator 
                    key={event.id} 
                    event={event} 
                    onClick={handleEventClick} 
                  />
                ))}
                
                {hasMoreEvents && (
                  <div 
                    className="text-[10px] font-medium text-muted-foreground px-1 mt-0.5 cursor-pointer hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDayClick(day);
                    }}
                  >
                    + {dayEvents.length - (maxVisibleEvents - 1)} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <MonthViewStyles />
    </div>
  );
}
