import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, isSameDay, parseISO, isSameMonth, isWithinInterval, areIntervalsOverlapping } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface MonthViewProps {
  days: Date[];
  events: CalendarEvent[];
  currentMonth: Date;
  onEventClick: (event: CalendarEvent) => void;
}

export function MonthView({ days, events, currentMonth, onEventClick }: MonthViewProps) {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Group events by week for multi-day rendering
  const getWeeklyEvents = () => {
    if (!events || events.length === 0) return [];
    
    // Split days into weeks
    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    // For each week, find events that span across days
    return weeks.map(week => {
      const weekStart = week[0];
      const weekEnd = week[6];
      
      // Get events that overlap with this week
      const weekEvents = events.filter(event => {
        const eventStart = parseISO(event.start_date);
        const eventEnd = parseISO(event.end_date);
        
        return areIntervalsOverlapping(
          { start: weekStart, end: weekEnd },
          { start: eventStart, end: eventEnd }
        );
      });
      
      // Calculate position and span for each event
      return weekEvents.map(event => {
        const eventStart = parseISO(event.start_date);
        const eventEnd = parseISO(event.end_date);
        
        // Find start and end day indices within this week
        const startIdx = week.findIndex(day => 
          isWithinInterval(day, { start: eventStart, end: eventEnd }) || isSameDay(day, eventStart)
        );
        
        const endIdx = week.findIndex((day, idx) => 
          (idx >= startIdx && (isSameDay(day, eventEnd) || day > eventEnd))
        );
        
        return {
          event,
          startIdx: startIdx === -1 ? 0 : startIdx,
          endIdx: endIdx === -1 ? 6 : endIdx,
          weekIdx: weeks.indexOf(week)
        };
      });
    }).flat();
  };

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

  // Get weekly events for multi-day rendering
  const weeklyEvents = getWeeklyEvents();

  return (
    <div className="month-view">
      <div className="calendar-grid grid-container">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center py-2 font-medium text-sm">
            {day}
          </div>
        ))}
        
        {/* Regular day cells */}
        {days.map((day, i) => {
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
              
              {/* Only show single-day events in day cells */}
              <div className="px-1 overflow-hidden">
                {getEventsForDay(day)
                  .filter(event => {
                    const eventStart = parseISO(event.start_date);
                    const eventEnd = parseISO(event.end_date);
                    return isSameDay(eventStart, eventEnd); // Only single-day events
                  })
                  .slice(0, 2)
                  .map(event => renderEventIndicator(event))
                }
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Multi-day events rendered on top of the grid */}
      <div className="multi-day-events-container">
        {weeklyEvents.map((weekEvent, idx) => {
          const { event, startIdx, endIdx, weekIdx } = weekEvent;
          const span = endIdx - startIdx + 1;
          
          // Skip rendering very short spans - they'll be shown in the day cells
          if (span <= 1) return null;
          
          const userInitials = event.user_profile?.full_name
            ? event.user_profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            : '?';

          return (
            <div 
              key={`${event.id}-${idx}`}
              className="multi-day-event absolute flex items-center rounded-md px-1 text-xs truncate cursor-pointer hover:opacity-90"
              style={{
                backgroundColor: event.color || '#7B68EE',
                color: 'white',
                gridRow: `${weekIdx + 2}`, // +2 to account for header row
                gridColumn: `${startIdx + 1} / span ${span}`,
                top: `${(weekIdx * 100) + 30}px`, // Positioning based on week
                height: '20px',
                zIndex: 10
              }}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event);
              }}
            >
              <Avatar className="h-3 w-3 mr-1">
                {event.user_profile?.avatar_url ? (
                  <AvatarImage src={event.user_profile.avatar_url} alt={event.user_profile.full_name || ''} />
                ) : null}
                <AvatarFallback className="text-[6px]">{userInitials}</AvatarFallback>
              </Avatar>
              <span className="truncate">{event.title}</span>
            </div>
          );
        })}
      </div>
      
      <style>
        {`
        .grid-container {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          position: relative;
        }
        
        .multi-day-events-container {
          position: relative;
          width: 100%;
          height: 0;
        }
        
        .multi-day-event {
          left: 0;
          right: 0;
        }
      `}
      </style>
    </div>
  );
}
