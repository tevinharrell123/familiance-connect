
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, isSameMonth, isToday, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { EnhancedCalendarEventCard } from './EnhancedCalendarEventCard';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDayClick?: (date: Date) => void;
}

export function MonthView({ currentDate, events, onEventClick, onDayClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      return isSameDay(day, eventStart) || 
             isSameDay(day, eventEnd) || 
             (day >= eventStart && day <= eventEnd);
    }).map(event => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      const duration = differenceInDays(eventEnd, eventStart) + 1;
      
      return {
        ...event,
        isMultiDay: duration > 1,
        duration,
        isFirstDay: isSameDay(day, eventStart),
        isLastDay: isSameDay(day, eventEnd)
      };
    });
  };

  const handleDayClick = (day: Date) => {
    console.log('Day clicked:', day);
    onDayClick?.(day);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    console.log('Event clicked:', event.title);
    e.stopPropagation();
    e.preventDefault();
    onEventClick(event);
  };

  return (
    <div className="month-view">
      {/* Header with day names */}
      <div className="grid grid-cols-7 gap-px mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-medium py-2 text-sm text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          
          return (
            <div
              key={day.toString()}
              className={cn(
                "min-h-[120px] bg-background p-2 cursor-pointer hover:bg-accent/50 transition-colors",
                !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                isCurrentDay && "bg-primary/10 ring-1 ring-primary/20"
              )}
              onClick={() => handleDayClick(day)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "text-sm font-medium",
                  isCurrentDay && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                )}>
                  {format(day, 'd')}
                </span>
                {dayEvents.length > 0 && (
                  <Badge variant="secondary" className="text-xs h-5">
                    {dayEvents.length}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1 max-h-[80px] overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => (
                  <EnhancedCalendarEventCard
                    key={`${event.id}-${day.toString()}`}
                    event={event}
                    onClick={(e) => handleEventClick(event, e)}
                    compact={true}
                    showMultiDayBadge={false}
                  />
                ))}
                
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center py-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
