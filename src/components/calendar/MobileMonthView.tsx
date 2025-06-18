
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, isSameMonth, isToday, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileMonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDayClick?: (date: Date) => void;
}

export function MobileMonthView({ 
  currentDate, 
  events, 
  onEventClick, 
  onDayClick
}: MobileMonthViewProps) {
  const isMobile = useIsMobile();
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
    });
  };

  const handleDayClick = (day: Date) => {
    console.log('Mobile day clicked:', day);
    onDayClick?.(day);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    console.log('Mobile event clicked:', event.title);
    e.stopPropagation();
    e.preventDefault();
    onEventClick(event);
  };

  if (!isMobile) {
    return null;
  }

  return (
    <div className="mobile-month-view">
      {/* Compact header with day names */}
      <div className="grid grid-cols-7 gap-px mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="text-center font-medium py-1 text-xs text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      
      {/* Compact calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          
          return (
            <div
              key={day.toString()}
              className={cn(
                "min-h-[50px] bg-background p-1 cursor-pointer hover:bg-accent/50 transition-colors active:bg-accent touch-manipulation",
                !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                isCurrentDay && "bg-primary/10 ring-1 ring-primary/20"
              )}
              onClick={() => handleDayClick(day)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "text-xs font-medium",
                  isCurrentDay && "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
                )}>
                  {format(day, 'd')}
                </span>
                {dayEvents.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-3 px-1 min-w-[12px]">
                    {dayEvents.length}
                  </Badge>
                )}
              </div>
              
              {/* Show event indicators with proper click handling */}
              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className="h-1.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: event.color || '#7B68EE' }}
                    onClick={(e) => handleEventClick(event, e)}
                    title={event.title}
                  />
                ))}
                
                {dayEvents.length > 2 && (
                  <div className="text-[8px] text-muted-foreground text-center">
                    +{dayEvents.length - 2}
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
