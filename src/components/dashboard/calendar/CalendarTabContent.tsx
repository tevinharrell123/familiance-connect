
import React from 'react';
import { CalendarEvent, CalendarViewType } from '@/types/calendar';
import { DashboardMonthView } from '@/components/calendar/DashboardMonthView';
import { EnhancedDayView } from '@/components/calendar/EnhancedDayView';
import { EnhancedWeekView } from '@/components/calendar/EnhancedWeekView';
import { CardContent } from '@/components/ui/card';

interface CalendarTabContentProps {
  currentDate: Date;
  days: Date[];
  events: CalendarEvent[];
  isLoading: boolean;
  error: any;
  selectedView: CalendarViewType;
  onViewChange: (view: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  onDateChange: (date: Date) => void;
  onDayClick: (date: Date) => void;
  onDateClick: (date: Date) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
}

export function CalendarTabContent({
  currentDate,
  days,
  events,
  isLoading,
  error,
  selectedView,
  onViewChange,
  onEventClick,
  onDateChange,
  onDayClick,
  onDateClick,
  onTimeSlotClick
}: CalendarTabContentProps) {
  if (isLoading) {
    return (
      <CardContent className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading calendar...</div>
      </CardContent>
    );
  }

  if (error) {
    return (
      <CardContent className="flex items-center justify-center h-64">
        <div className="text-destructive">Error loading calendar events</div>
      </CardContent>
    );
  }

  const renderCalendarView = () => {
    switch (selectedView) {
      case 'day':
        return (
          <EnhancedDayView
            currentDate={currentDate}
            events={events}
            onEventClick={onEventClick}
            onTimeSlotClick={onTimeSlotClick}
          />
        );
      case 'week':
        return (
          <EnhancedWeekView
            currentDate={currentDate}
            events={events}
            onEventClick={onEventClick}
            onTimeSlotClick={onTimeSlotClick}
          />
        );
      case 'month':
      default:
        return (
          <DashboardMonthView
            currentDate={currentDate}
            events={events}
            onEventClick={onEventClick}
            onDateClick={onDateClick}
          />
        );
    }
  };

  return (
    <CardContent className="p-4 h-full overflow-auto">
      {renderCalendarView()}
    </CardContent>
  );
}
