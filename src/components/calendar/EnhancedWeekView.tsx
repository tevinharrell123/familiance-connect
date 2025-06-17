
import React, { useState } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, getHours, getMinutes, differenceInDays, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EnhancedWeekViewProps {
  currentDate: Date;
  events?: CalendarEvent[];
  isLoading?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

export function EnhancedWeekView({ currentDate, events = [], isLoading, onEventClick, onTimeSlotClick }: EnhancedWeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Separate all-day and timed events
  const { allDayEvents, timedEvents } = events.reduce((acc, event) => {
    const eventStart = parseISO(event.start_date);
    const eventEnd = parseISO(event.end_date);
    const startHour = getHours(eventStart);
    const startMinute = getMinutes(eventStart);
    const endHour = getHours(eventEnd);
    const endMinute = getMinutes(eventEnd);
    
    // Consider it all-day if it spans multiple days or starts at 00:00 and ends at 23:59
    const isAllDay = differenceInDays(eventEnd, eventStart) > 0 || 
                     (startHour === 0 && startMinute === 0 && endHour === 23 && endMinute >= 59);
    
    if (isAllDay) {
      acc.allDayEvents.push(event);
    } else {
      acc.timedEvents.push(event);
    }
    
    return acc;
  }, { allDayEvents: [] as CalendarEvent[], timedEvents: [] as CalendarEvent[] });

  const getEventsForDay = (day: Date, eventList: CalendarEvent[]) => {
    return eventList.filter(event => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      return isSameDay(day, eventStart) || 
             isSameDay(day, eventEnd) || 
             (day >= eventStart && day <= eventEnd);
    });
  };

  const getEventsForHour = (day: Date, hour: number) => {
    return timedEvents.filter(event => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      
      if (!isSameDay(day, eventStart)) return false;
      
      const eventStartHour = getHours(eventStart);
      const eventEndHour = getHours(eventEnd);
      
      return hour >= eventStartHour && hour <= eventEndHour;
    });
  };

  const getEventPosition = (event: CalendarEvent) => {
    const eventStart = parseISO(event.start_date);
    const startHour = getHours(eventStart);
    const startMinute = getMinutes(eventStart);
    const eventEnd = parseISO(event.end_date);
    const endHour = getHours(eventEnd);
    const endMinute = getMinutes(eventEnd);
    
    const top = (startHour + startMinute / 60) * 60; // 60px per hour
    const duration = (endHour + endMinute / 60) - (startHour + startMinute / 60);
    const height = Math.max(duration * 60, 30); // Minimum 30px height
    
    return { top, height };
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
    <div className="enhanced-week-view h-full flex flex-col">
      {/* All-day events section */}
      {allDayEvents.length > 0 && (
        <div className="border-b bg-muted/30">
          <div className="grid grid-cols-8 gap-px">
            <div className="p-2 text-xs font-medium text-muted-foreground">
              All Day
            </div>
            {weekDays.map((day) => {
              const dayAllDayEvents = getEventsForDay(day, allDayEvents);
              
              return (
                <div key={day.toString()} className="p-1 min-h-[60px]">
                  <div className="space-y-1">
                    {dayAllDayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: `${event.color || '#7B68EE'}30`,
                          borderLeft: `3px solid ${event.color || '#7B68EE'}`
                        }}
                        onClick={() => onEventClick?.(event)}
                      >
                        <div className="flex items-center gap-1 truncate">
                          <Avatar className="h-3 w-3">
                            {event.user_profile?.avatar_url ? (
                              <AvatarImage src={event.user_profile.avatar_url} />
                            ) : null}
                            <AvatarFallback className="text-[8px]">
                              {getUserInitials(event)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate font-medium">{event.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Time grid */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-8 gap-px relative">
          {/* Time column */}
          <div className="sticky left-0 bg-background border-r">
            {hours.map((hour) => (
              <div key={hour} className="h-[60px] flex items-start justify-end pr-2 text-xs text-muted-foreground border-b">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => (
            <div key={day.toString()} className="relative border-r">
              {/* Day header */}
              <div className={cn(
                "sticky top-0 bg-background border-b p-2 text-center z-10",
                isToday(day) && "bg-primary/10"
              )}>
                <div className="text-xs font-medium">{format(day, 'EEE')}</div>
                <div className={cn(
                  "text-lg font-semibold",
                  isToday(day) && "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                )}>
                  {format(day, 'd')}
                </div>
              </div>

              {/* Hour slots */}
              <div className="relative">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] border-b hover:bg-accent/30 cursor-pointer transition-colors"
                    onClick={() => onTimeSlotClick?.(day, hour)}
                  >
                    {/* Hour events */}
                    {getEventsForHour(day, hour).map((event, eventIndex) => {
                      const position = getEventPosition(event);
                      
                      return (
                        <div
                          key={event.id}
                          className="absolute left-1 right-1 rounded text-xs p-1 cursor-pointer hover:opacity-80 transition-opacity z-20"
                          style={{
                            top: position.top - (hour * 60),
                            height: position.height,
                            backgroundColor: `${event.color || '#7B68EE'}90`,
                            color: 'white',
                            marginLeft: eventIndex * 4 // Offset overlapping events
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-[10px] opacity-90">
                            {format(parseISO(event.start_date), 'h:mm a')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
