
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, isSameMonth, isToday, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { School, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardMonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const getEventIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('school') || lowerTitle.includes('education') || lowerTitle.includes('kid')) {
    return <School className="h-4 w-4 text-blue-500" />;
  }
  if (lowerTitle.includes('bill') || lowerTitle.includes('pay') || lowerTitle.includes('payment') || lowerTitle.includes('due')) {
    return <DollarSign className="h-4 w-4 text-green-500" />;
  }
  return <DollarSign className="h-4 w-4 text-gray-500" />; // Default icon
};

export function DashboardMonthView({ currentDate, events, onEventClick }: DashboardMonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

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
                "min-h-[80px] p-1 border rounded-sm",
                !isSameMonth(day, currentDate) && "bg-muted/50",
                isToday(day) && "bg-accent/50"
              )}
            >
              <div className="text-xs font-medium">{format(day, 'd')}</div>
              <div className="mt-1 space-y-1 max-h-[60px] overflow-y-auto">
                {dayEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="w-full flex items-center gap-1 p-1 text-xs rounded hover:bg-accent truncate"
                  >
                    {getEventIcon(event.title)}
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
