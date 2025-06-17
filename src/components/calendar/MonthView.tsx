
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, isSameMonth, isToday, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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

  const getUserInitials = (event: CalendarEvent) => {
    const fullName = event.user_profile?.full_name || '';
    return fullName
      ? fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : '?';
  };

  const getEventStyle = (event: CalendarEvent & { isMultiDay?: boolean; isFirstDay?: boolean; isLastDay?: boolean }) => {
    const baseColor = event.color || '#7B68EE';
    let borderRadius = 'rounded-sm';
    
    if (event.isMultiDay) {
      if (event.isFirstDay && event.isLastDay) {
        borderRadius = 'rounded-sm';
      } else if (event.isFirstDay) {
        borderRadius = 'rounded-l-sm rounded-r-none';
      } else if (event.isLastDay) {
        borderRadius = 'rounded-r-sm rounded-l-none';
      } else {
        borderRadius = 'rounded-none';
      }
    }
    
    return {
      backgroundColor: `${baseColor}20`,
      borderColor: baseColor,
      className: `${borderRadius} border-l-2`
    };
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
              onClick={() => onDayClick?.(day)}
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
                {dayEvents.slice(0, 3).map((event) => {
                  const eventStyle = getEventStyle(event);
                  
                  return (
                    <div
                      key={`${event.id}-${day.toString()}`}
                      className={cn(
                        "text-xs p-1 cursor-pointer hover:opacity-80 transition-opacity",
                        eventStyle.className
                      )}
                      style={{ 
                        backgroundColor: eventStyle.backgroundColor,
                        borderColor: eventStyle.borderColor
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                    >
                      <div className="flex items-center gap-1 truncate">
                        {event.isFirstDay && (
                          <Avatar className="h-3 w-3 flex-shrink-0">
                            {event.user_profile?.avatar_url ? (
                              <AvatarImage src={event.user_profile.avatar_url} />
                            ) : null}
                            <AvatarFallback className="text-[8px]">
                              {getUserInitials(event)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <span className="truncate font-medium">
                          {event.title}
                        </span>
                        {event.isMultiDay && event.isFirstDay && (
                          <span className="text-[8px] opacity-70">
                            {event.duration}d
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                
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
