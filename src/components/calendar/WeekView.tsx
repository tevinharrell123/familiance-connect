import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, getHours, getMinutes, differenceInMinutes, isAfter, isBefore, isWithinInterval } from 'date-fns';
import { EnhancedCalendarEventCard } from './EnhancedCalendarEventCard';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useChildProfiles } from '@/hooks/household/useChildProfiles';
import { useFamilyMembers } from '@/hooks/household/useFamilyMembers';

interface WeekViewProps {
  currentDate: Date;
  events?: CalendarEvent[];
  isLoading?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  onDateChange?: (date: Date) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

export function WeekView({ currentDate, events = [], isLoading, onEventClick, onDateChange, onTimeSlotClick }: WeekViewProps) {
  const { childProfiles } = useChildProfiles();
  const { members: householdMembers } = useFamilyMembers();
  
  // Get start and end of the week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // 0 = Sunday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  
  // Get all days in the week
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Helper function to check if event is all-day
  const isAllDayEvent = (event: CalendarEvent): boolean => {
    try {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      
      const startHour = getHours(eventStart);
      const startMinute = getMinutes(eventStart);
      const endHour = getHours(eventEnd);
      const endMinute = getMinutes(eventEnd);
      
      // Check if it starts at 00:00 and ends at 23:59 or 00:00 next day
      return (startHour === 0 && startMinute === 0) && 
             ((endHour === 23 && endMinute >= 59) || (endHour === 0 && endMinute === 0));
    } catch (error) {
      console.error('Error checking all-day event:', event.start_date, error);
      return false;
    }
  };

  // Helper function to get event's time slot (hour 0-23)
  const getEventTimeSlot = (event: CalendarEvent): number => {
    try {
      const eventStart = parseISO(event.start_date);
      return getHours(eventStart);
    } catch (error) {
      console.error('Error getting event time slot:', event.start_date, error);
      return 0;
    }
  };

  // Helper function to get event start time
  const getEventStartTime = (event: CalendarEvent): Date => {
    try {
      return parseISO(event.start_date);
    } catch (error) {
      console.error('Error parsing event start time:', event.start_date, error);
      return new Date();
    }
  };

  // Helper function to calculate event height based on duration
  const calculateEventHeight = (event: CalendarEvent): number => {
    try {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      const durationMinutes = differenceInMinutes(eventEnd, eventStart);
      
      // Convert duration to pixels (60px per hour)
      const heightPerMinute = 60 / 60; // 60px per hour, so 1px per minute
      return Math.max(20, durationMinutes * heightPerMinute); // Minimum 20px height
    } catch (error) {
      console.error('Error calculating event height:', event.start_date, event.end_date, error);
      return 20;
    }
  };

  // Helper function to get events for a specific hour and day
  const getEventsForHourAndDay = (hour: number, day: Date): CalendarEvent[] => {
    if (!events || events.length === 0) return [];
    
    return events.filter(event => {
      // Skip all-day events
      if (isAllDayEvent(event)) return false;
      
      try {
        const eventStart = parseISO(event.start_date);
        const eventHour = getHours(eventStart);
        
        // Check if event is on the same day AND starts in this hour
        return isSameDay(day, eventStart) && eventHour === hour;
      } catch (error) {
        console.error('Error filtering events for hour and day:', event.start_date, error);
        return false;
      }
    });
  };

  // Get all-day events for a specific day
  const getAllDayEventsForDay = (day: Date): CalendarEvent[] => {
    if (!events || events.length === 0) return [];
    
    return events.filter(event => {
      if (!isAllDayEvent(event)) return false;
      
      try {
        const eventStart = parseISO(event.start_date);
        const eventEnd = parseISO(event.end_date);
        
        return isSameDay(day, eventStart) || 
               isSameDay(day, eventEnd) || 
               (isAfter(day, eventStart) && isBefore(day, eventEnd));
      } catch (error) {
        console.error('Error filtering all-day events:', event.start_date, error);
        return false;
      }
    });
  };
  
  // Get assigned person info
  const getAssignedPerson = (event: CalendarEvent) => {
    if (event.assigned_to_child) {
      const child = childProfiles?.find(c => c.id === event.assigned_to_child);
      if (child) {
        return {
          name: child.name,
          avatar_url: child.avatar_url,
          initials: child.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        };
      }
    }
    
    if (event.assigned_to_member) {
      const member = householdMembers?.find(m => m.user_id === event.assigned_to_member);
      if (member) {
        return {
          name: member.user_profiles?.full_name || 'Unknown Member',
          avatar_url: member.user_profiles?.avatar_url,
          initials: (member.user_profiles?.full_name || 'UM').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        };
      }
    }
    
    if (event.user_profile) {
      return {
        name: event.user_profile.full_name || 'Unknown User',
        avatar_url: event.user_profile.avatar_url,
        initials: (event.user_profile.full_name || 'UU').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      };
    }
    
    return null;
  };

  // Event Block Component
  const EventBlock = ({ event }: { event: CalendarEvent }) => {
    const assignedPerson = getAssignedPerson(event);
    const eventStart = getEventStartTime(event);
    const eventEnd = parseISO(event.end_date);
    const height = calculateEventHeight(event);
    const startMinutes = getMinutes(eventStart);
    
    // Calculate position within the hour
    const topOffset = (startMinutes / 60) * 60; // 60px per hour

    return (
      <div
        className="absolute left-0.5 right-0.5 p-1 text-xs rounded cursor-pointer hover:opacity-80 transition-opacity overflow-hidden z-10"
        style={{ 
          backgroundColor: `${event.color || '#7B68EE'}90`,
          borderLeft: `3px solid ${event.color || '#7B68EE'}`,
          height: `${Math.min(height, 60 - topOffset)}px`, // Don't exceed hour boundary
          top: `${topOffset}px`
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onEventClick) onEventClick(event);
        }}
      >
        <div className="flex items-center gap-1">
          {assignedPerson && (
            <Avatar className="h-3 w-3 flex-shrink-0">
              {assignedPerson.avatar_url ? (
                <AvatarImage src={assignedPerson.avatar_url} />
              ) : null}
              <AvatarFallback className="text-[7px]">
                {assignedPerson.initials}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="truncate flex-1">
            <div className="font-medium truncate text-white">{event.title}</div>
            <div className="text-[10px] text-white/80">
              {format(eventStart, 'h:mm a')}
              {differenceInMinutes(eventEnd, eventStart) > 30 && ` - ${format(eventEnd, 'h:mm a')}`}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      console.log('Event clicked in WeekView:', event.id);
      onEventClick(event);
    }
  };

  const handleTimeSlotClick = (day: Date, hour: number) => {
    if (onTimeSlotClick) {
      onTimeSlotClick(day, hour);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <h2 className="text-xl font-semibold text-center mb-4">
        {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
      </h2>
      
      {/* All Day Events Section */}
      <div className="mb-4 border rounded-lg">
        <div className="grid grid-cols-8 border-b bg-muted/50">
          <div className="p-2 text-sm font-medium border-r">All Day</div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="p-2 text-center text-sm font-medium border-r last:border-r-0">
              <div>{format(day, 'EEE')}</div>
              <div className={`text-lg ${isSameDay(day, new Date()) ? 'text-primary font-bold' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-8 min-h-[60px]">
          <div className="border-r"></div>
          {weekDays.map((day) => {
            const allDayEvents = getAllDayEventsForDay(day);
            return (
              <div key={day.toISOString()} className="p-1 border-r last:border-r-0 space-y-1">
                {allDayEvents.map(event => {
                  const assignedPerson = getAssignedPerson(event);
                  return (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1"
                      style={{ 
                        backgroundColor: `${event.color || '#7B68EE'}20`,
                        borderLeft: `3px solid ${event.color || '#7B68EE'}`
                      }}
                      onClick={() => handleEventClick(event)}
                    >
                      {assignedPerson && (
                        <Avatar className="h-4 w-4 flex-shrink-0">
                          {assignedPerson.avatar_url ? (
                            <AvatarImage src={assignedPerson.avatar_url} />
                          ) : null}
                          <AvatarFallback className="text-[8px]">
                            {assignedPerson.initials}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="truncate font-medium">{event.title}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Grid - Restructured for proper event positioning */}
      <div className="border rounded-lg overflow-hidden">
        {Array.from({ length: 24 }, (_, hour) => (
          <div key={hour} className="grid grid-cols-8 border-b">
            {/* Time label */}
            <div className="text-xs p-2 border-r bg-muted/30 flex items-start justify-end">
              {hour === 0 ? '12 AM' : 
               hour < 12 ? `${hour} AM` : 
               hour === 12 ? '12 PM' : 
               `${hour - 12} PM`}
            </div>
            
            {/* Day columns */}
            {weekDays.map(day => (
              <div 
                key={`${day.toISOString()}-${hour}`}
                className="border-r last:border-r-0 p-1 min-h-[60px] relative cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => handleTimeSlotClick(day, hour)}
              >
                {/* 30-minute reference line */}
                <div className="absolute left-0 right-0 h-px bg-muted/30" style={{ top: '30px' }}></div>
                
                {/* Events for this hour and day */}
                {getEventsForHourAndDay(hour, day).map(event => (
                  <EventBlock key={event.id} event={event} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
