
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, isSameDay, parseISO } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface MonthViewProps {
  days: Date[];
  events: CalendarEvent[];
  currentMonth: Date;
  onEventClick: (event: CalendarEvent) => void;
}

export function MonthView({ days, events, currentMonth, onEventClick }: MonthViewProps) {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getEventsForDay = (day: Date): CalendarEvent[] => {
    if (!events || events.length === 0) return [];
    
    return events.filter(event => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      
      // Check if the day falls within the event's date range
      return (day >= eventStart && day <= eventEnd) || 
             isSameDay(day, eventStart) || 
             isSameDay(day, eventEnd);
    });
  };

  const renderEventIndicator = (event: CalendarEvent) => {
    const userInitials = event.user_profile?.full_name
      ? event.user_profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : '?';
      
    return (
      <div 
        key={event.id} 
        className="flex items-center text-xs rounded-full px-1 mt-1 truncate cursor-pointer hover:opacity-80"
        style={{ backgroundColor: `${event.color || '#7B68EE'}30` }}
        onClick={(e) => {
          e.stopPropagation();
          onEventClick(event);
        }}
      >
        <Avatar className="h-4 w-4 mr-1">
          {event.user_profile?.avatar_url ? (
            <AvatarImage src={event.user_profile.avatar_url} alt={event.user_profile.full_name || ''} />
          ) : null}
          <AvatarFallback className="text-[8px]">{userInitials}</AvatarFallback>
        </Avatar>
        <span className="truncate">{event.title}</span>
      </div>
    );
  };

  return (
    <div className="month-view">
      <div className="calendar-grid">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center py-2 font-medium text-sm">
            {day}
          </div>
        ))}
        
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isToday = isSameDay(day, new Date());
          
          return (
            <div 
              key={i} 
              className={`calendar-day border ${
                isCurrentMonth ? 'bg-white' : 'text-gray-300 bg-gray-50'
              } ${isToday ? 'border-primary' : ''}`}
            >
              <div className={`text-sm p-1 ${isToday ? 'font-bold text-primary' : ''}`}>
                {format(day, 'd')}
              </div>
              
              <div className="px-1 overflow-hidden">
                {dayEvents.length > 0 ? (
                  <>
                    {dayEvents.slice(0, 2).map(event => renderEventIndicator(event))}
                    
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-center mt-1 text-muted-foreground">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
