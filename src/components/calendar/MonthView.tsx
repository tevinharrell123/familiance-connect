
import React, { useEffect, useState } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, isSameMonth } from 'date-fns';
import { getEventsForDay } from './utils/calendarEventUtils';
import { EventIndicator } from './EventIndicator';
import { MonthViewStyles } from './MonthViewStyles';
import { useIsMobile } from '@/hooks/use-mobile';

interface MonthViewProps {
  currentMonth: Date;
  days?: Date[];
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDayClick?: (date: Date) => void;
}

export function MonthView({ currentMonth, events, onEventClick, onDayClick }: MonthViewProps) {
  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const isMobile = useIsMobile();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Generate days for the month view
  const getMonthDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };
  
  const days = getMonthDays();
  
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
  let maxVisibleEvents = 8;
  if (windowWidth <= 480) {
    maxVisibleEvents = 2;
  } else if (windowWidth <= 640) {
    maxVisibleEvents = 3;
  } else if (windowWidth <= 768) {
    maxVisibleEvents = 4;
  } else if (windowWidth <= 1024) {
    maxVisibleEvents = 6;
  }

  // Determine day label format based on screen size
  const getDayLabel = (day: string) => {
    if (windowWidth <= 480) {
      return day.charAt(0);
    } else if (windowWidth <= 640) {
      return day.substring(0, 3);
    }
    return day;
  };

  // Process events to identify multi-day events for special handling
  const getProcessedEventsForDay = (day: Date) => {
    const dayEvents = getEventsForDay(day, events);
    
    // Sort events so multi-day events appear first
    return dayEvents.sort((a, b) => {
      const aStart = parseISO(a.start_date);
      const aEnd = parseISO(a.end_date);
      const bStart = parseISO(b.start_date);
      const bEnd = parseISO(b.end_date);
      
      const aIsMultiDay = !isSameDay(aStart, aEnd);
      const bIsMultiDay = !isSameDay(bStart, bEnd);
      
      // Multi-day events come first
      if (aIsMultiDay && !bIsMultiDay) return -1;
      if (!aIsMultiDay && bIsMultiDay) return 1;
      
      // Then sort by start date
      return aStart.getTime() - bStart.getTime();
    });
  };

  return (
    <div className="month-view relative flex-grow h-full">
      <table className="calendar-table w-full h-full border-collapse">
        <thead>
          <tr className="calendar-header">
            {weekDays.map((day, i) => (
              <th key={i} className="text-center py-2 font-medium text-xs sm:text-sm border-b bg-muted">
                {getDayLabel(day)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Group days into weeks */}
          {Array(Math.ceil(days.length / 7)).fill(null).map((_, weekIndex) => (
            <tr key={weekIndex} className="calendar-week">
              {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, i) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());
                
                // Get events for this day
                const dayEvents = getProcessedEventsForDay(day);
                
                // Determine if we should show more events indicator
                const hasMoreEvents = dayEvents.length > maxVisibleEvents;
                const visibleEvents = hasMoreEvents 
                  ? dayEvents.slice(0, maxVisibleEvents - 1) 
                  : dayEvents;
                
                return (
                  <td 
                    key={i} 
                    className={`calendar-day border p-0.5 align-top relative ${
                      isCurrentMonth ? 'bg-card' : 'text-muted-foreground bg-muted/20'
                    } ${isToday ? 'border-primary' : ''} ${
                      isCurrentMonth ? 'cursor-pointer hover:bg-muted/10' : ''
                    }`}
                    onClick={() => isCurrentMonth && handleDayClick(day)}
                  >
                    <div className="day-header flex justify-between items-center p-1">
                      <div className={`text-xs sm:text-sm font-medium ${isToday ? 'text-primary font-bold bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                        {format(day, 'd')}
                      </div>
                      {isCurrentMonth && i === 0 && weekIndex < 2 && (
                        <div className="text-xs text-muted-foreground hidden sm:block">
                          {format(day, 'MMM')}
                        </div>
                      )}
                    </div>
                    
                    <div className="overflow-y-auto day-events-container">
                      {visibleEvents.map(event => {
                        const eventStart = parseISO(event.start_date);
                        const eventEnd = parseISO(event.end_date);
                        const isMultiDay = !isSameDay(eventStart, eventEnd);
                        const isFirstDay = isSameDay(day, eventStart);
                        const isLastDay = isSameDay(day, eventEnd);
                        
                        return (
                          <EventIndicator 
                            key={event.id} 
                            event={event}
                            isMultiDay={isMultiDay}
                            isFirstDay={isFirstDay}
                            isLastDay={isLastDay}
                            onClick={handleEventClick} 
                          />
                        );
                      })}
                      
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
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      <MonthViewStyles />
    </div>
  );
}
