
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, getHours, getMinutes, differenceInMinutes, isAfter, isBefore } from 'date-fns';
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
  
  // Generate hours array (24 hours)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Separate all-day events from time-specific events
  const separateEvents = (day: Date) => {
    if (!events || events.length === 0) return { allDayEvents: [], timeEvents: [] };
    
    const dayEvents = events.filter(event => {
      if (!event) return false;
      
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      return isSameDay(day, eventStart) || 
             isSameDay(day, eventEnd) || 
             (isAfter(day, eventStart) && isBefore(day, eventEnd));
    });
    
    const allDayEvents = dayEvents.filter(event => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      
      // Check if it's truly an all-day event (starts at 00:00 and ends at 23:59 or next day 00:00)
      const startHour = getHours(eventStart);
      const startMinute = getMinutes(eventStart);
      const endHour = getHours(eventEnd);
      const endMinute = getMinutes(eventEnd);
      
      return (startHour === 0 && startMinute === 0) && 
             ((endHour === 23 && endMinute >= 59) || (endHour === 0 && endMinute === 0));
    });
    
    const timeEvents = dayEvents.filter(event => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      
      const startHour = getHours(eventStart);
      const startMinute = getMinutes(eventStart);
      const endHour = getHours(eventEnd);
      const endMinute = getMinutes(eventEnd);
      
      return !((startHour === 0 && startMinute === 0) && 
               ((endHour === 23 && endMinute >= 59) || (endHour === 0 && endMinute === 0)));
    });
    
    return { allDayEvents, timeEvents };
  };
  
  // Get events for a specific time slot
  const getEventsForTimeSlot = (day: Date, hour: number) => {
    const { timeEvents } = separateEvents(day);
    
    return timeEvents.filter(event => {
      const eventStart = parseISO(event.start_date);
      const eventHour = getHours(eventStart);
      return eventHour === hour && isSameDay(day, eventStart);
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
            const { allDayEvents } = separateEvents(day);
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

      {/* Time Grid */}
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 gap-0">
          {/* Time labels column */}
          <div className="border-r bg-muted/30">
            <div className="h-8 border-b"></div> {/* Header spacer */}
            {hours.map((hour) => (
              <div key={hour} className="h-16 border-b text-xs p-1 flex items-start justify-end pr-2">
                {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="border-r last:border-r-0">
              {/* Day header */}
              <div className="h-8 border-b bg-muted/50 flex items-center justify-center text-sm font-medium">
                {format(day, 'EEE d')}
              </div>
              
              {/* Hour slots */}
              {hours.map((hour) => {
                const slotEvents = getEventsForTimeSlot(day, hour);
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="h-16 border-b relative cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => handleTimeSlotClick(day, hour)}
                  >
                    {slotEvents.map((event, index) => {
                      const eventStart = parseISO(event.start_date);
                      const eventEnd = parseISO(event.end_date);
                      const durationMinutes = differenceInMinutes(eventEnd, eventStart);
                      const height = Math.max(16, (durationMinutes / 60) * 64); // 64px per hour
                      const assignedPerson = getAssignedPerson(event);
                      
                      return (
                        <div
                          key={event.id}
                          className="absolute left-0 right-0 mx-0.5 p-1 text-xs rounded cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                          style={{ 
                            backgroundColor: `${event.color || '#7B68EE'}80`,
                            borderLeft: `3px solid ${event.color || '#7B68EE'}`,
                            height: `${Math.min(height, 60)}px`,
                            top: `${index * 2}px`,
                            zIndex: 10
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
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
                            <div className="truncate">
                              <div className="font-medium truncate">{event.title}</div>
                              <div className="text-[10px] opacity-75">
                                {format(eventStart, 'h:mm a')}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
