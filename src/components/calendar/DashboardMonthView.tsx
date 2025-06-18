
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, isSameMonth, isToday, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { School, DollarSign } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface DashboardMonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

const getUserInitials = (name: string | null | undefined): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const getEventIcon = (event: CalendarEvent) => {
  const lowerTitle = event.title.toLowerCase();
  
  // Check if event has an assigned person - show avatar if available
  const assignedPerson = event.assigned_user_profile || event.assigned_member_profile || event.assigned_child_profile;
  
  if (assignedPerson) {
    const name = 'full_name' in assignedPerson ? assignedPerson.full_name : assignedPerson.name;
    return (
      <Avatar className="h-4 w-4">
        {assignedPerson.avatar_url ? (
          <AvatarImage src={assignedPerson.avatar_url} alt={name || 'User'} />
        ) : null}
        <AvatarFallback className="text-[8px]">
          {getUserInitials(name)}
        </AvatarFallback>
      </Avatar>
    );
  }
  
  // Fallback to icons for specific event types
  if (lowerTitle.includes('school') || lowerTitle.includes('education') || lowerTitle.includes('kid')) {
    return <School className="h-4 w-4 text-blue-500" />;
  }
  if (lowerTitle.includes('bill') || lowerTitle.includes('pay') || lowerTitle.includes('payment') || lowerTitle.includes('due')) {
    return <DollarSign className="h-4 w-4 text-green-500" />;
  }
  return <DollarSign className="h-4 w-4 text-gray-500" />;
};

export function DashboardMonthView({ currentDate, events, onEventClick, onDateClick }: DashboardMonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleDateClick = (day: Date, e: React.MouseEvent) => {
    // Check if the click was on an event element
    const target = e.target as HTMLElement;
    const isEventClick = target.closest('[data-event-id]') || 
                        target.classList.contains('event-item') ||
                        target.closest('.event-item');
    
    if (!isEventClick && onDateClick) {
      onDateClick(day);
    }
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEventClick(event);
  };

  return (
    <div className="dashboard-month-view">
      <div className="grid grid-cols-7 gap-1 text-xs mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-medium py-1">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, dayIdx) => {
          const dayEvents = events.filter(event => 
            format(new Date(event.start_date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
          );

          return (
            <div
              key={day.toString()}
              className={cn(
                "min-h-[80px] p-1 border rounded-sm cursor-pointer hover:bg-accent/50 transition-colors",
                !isSameMonth(day, currentDate) && "bg-muted/50",
                isToday(day) && "bg-accent/50"
              )}
              onClick={(e) => handleDateClick(day, e)}
            >
              <div className="text-xs font-medium">{format(day, 'd')}</div>
              <div className="mt-1 space-y-1 max-h-[60px] overflow-y-auto">
                {dayEvents.map((event) => (
                  <button
                    key={event.id}
                    data-event-id={event.id}
                    onClick={(e) => handleEventClick(event, e)}
                    className="event-item w-full flex items-center gap-1 p-1 text-xs rounded hover:bg-accent truncate"
                    style={{ 
                      borderLeft: `3px solid ${event.color || '#7B68EE'}`,
                      backgroundColor: `${event.color || '#7B68EE'}10`
                    }}
                  >
                    {getEventIcon(event)}
                    <span className="truncate">{event.title}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
