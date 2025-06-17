
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, parseISO, getHours, getMinutes, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface EnhancedDayViewProps {
  currentDate: Date;
  events?: CalendarEvent[];
  isLoading?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

export function EnhancedDayView({ currentDate, events = [], isLoading, onEventClick, onTimeSlotClick }: EnhancedDayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Filter events for the current day
  const dayEvents = events.filter(event => {
    const eventStart = parseISO(event.start_date);
    const eventEnd = parseISO(event.end_date);
    return isSameDay(currentDate, eventStart) || 
           isSameDay(currentDate, eventEnd) || 
           (currentDate >= eventStart && currentDate <= eventEnd);
  });

  // Group events by hour for better layout
  const getEventsForHour = (hour: number) => {
    return dayEvents.filter(event => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      const eventStartHour = getHours(eventStart);
      const eventEndHour = getHours(eventEnd);
      
      return hour >= eventStartHour && hour <= eventEndHour;
    });
  };

  const getEventPosition = (event: CalendarEvent, eventIndex: number, totalEvents: number) => {
    const eventStart = parseISO(event.start_date);
    const startHour = getHours(eventStart);
    const startMinute = getMinutes(eventStart);
    const eventEnd = parseISO(event.end_date);
    const endHour = getHours(eventEnd);
    const endMinute = getMinutes(eventEnd);
    
    const top = (startHour + startMinute / 60) * 80; // 80px per hour
    const duration = (endHour + endMinute / 60) - (startHour + startMinute / 60);
    const height = Math.max(duration * 80, 40); // Minimum 40px height
    
    // Position overlapping events side by side
    const width = totalEvents > 1 ? `${100 / totalEvents}%` : '100%';
    const left = totalEvents > 1 ? `${(eventIndex * 100) / totalEvents}%` : '0%';
    
    return { top, height, width, left };
  };

  const getUserInitials = (event: CalendarEvent) => {
    const fullName = event.user_profile?.full_name || '';
    return fullName
      ? fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : '?';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="enhanced-day-view h-full flex flex-col">
      {/* Day header */}
      <div className="border-b p-4 bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{format(currentDate, 'EEEE')}</h2>
            <p className="text-lg text-muted-foreground">{format(currentDate, 'MMMM d, yyyy')}</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Timeline */}
      <ScrollArea className="flex-1">
        <div className="flex">
          {/* Time column */}
          <div className="w-20 border-r bg-muted/30">
            {hours.map((hour) => (
              <div key={hour} className="h-[80px] flex items-start justify-end pr-3 pt-1 text-sm text-muted-foreground border-b">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="flex-1 relative">
            {/* Hour grid */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[80px] border-b hover:bg-accent/20 cursor-pointer transition-colors relative"
                onClick={() => onTimeSlotClick?.(currentDate, hour)}
              >
                {/* Half-hour line */}
                <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-border/50" />
              </div>
            ))}

            {/* Events overlay */}
            <div className="absolute inset-0">
              {hours.map((hour) => {
                const hourEvents = getEventsForHour(hour);
                
                return (
                  <div key={hour} className="relative h-[80px]">
                    {hourEvents.map((event, eventIndex) => {
                      const position = getEventPosition(event, eventIndex, hourEvents.length);
                      
                      return (
                        <div
                          key={event.id}
                          className="absolute rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-all z-10"
                          style={{
                            top: position.top - (hour * 80),
                            height: position.height,
                            width: position.width,
                            left: position.left,
                            backgroundColor: `${event.color || '#7B68EE'}20`,
                            borderColor: event.color || '#7B68EE',
                            borderLeftWidth: '4px'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                        >
                          <div className="p-2 h-full flex flex-col">
                            <div className="flex items-start gap-2 mb-1">
                              <Avatar className="h-5 w-5 flex-shrink-0">
                                {event.user_profile?.avatar_url ? (
                                  <AvatarImage src={event.user_profile.avatar_url} />
                                ) : null}
                                <AvatarFallback className="text-xs">
                                  {getUserInitials(event)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{event.title}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {format(parseISO(event.start_date), 'h:mm a')} - {format(parseISO(event.end_date), 'h:mm a')}
                                </p>
                              </div>
                            </div>
                            
                            {event.description && position.height > 60 && (
                              <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                                {event.description}
                              </p>
                            )}
                            
                            {event.is_household_event && (
                              <Badge variant="secondary" className="text-xs w-fit mt-1">
                                Household
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* No events message */}
      {dayEvents.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg mb-2">No events scheduled</p>
            <p className="text-sm">Click on a time slot to add an event</p>
          </div>
        </div>
      )}
    </div>
  );
}
