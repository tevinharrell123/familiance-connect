
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardMonthView } from '@/components/calendar/DashboardMonthView';
import { WeekView } from '@/components/calendar/WeekView';
import { DayView } from '@/components/calendar/DayView';
import { CalendarEvent, CalendarViewType } from '@/types/calendar';
import { Loader2 } from 'lucide-react';

interface CalendarTabContentProps {
  currentDate: Date;
  days: Date[];
  events: CalendarEvent[];
  isLoading: boolean;
  error: Error | null;
  selectedView: CalendarViewType;
  onViewChange: (view: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  onDateChange: (date: Date) => void;
  onDayClick: (date: Date) => void;
  onDateClick?: (date: Date) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

export function CalendarTabContent({
  currentDate,
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        Error loading calendar: {error.message}
      </div>
    );
  }

  return (
    <Tabs value={selectedView} onValueChange={onViewChange} className="h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-3 mx-4">
        <TabsTrigger value="month">Month</TabsTrigger>
        <TabsTrigger value="week">Week</TabsTrigger>
        <TabsTrigger value="day">Day</TabsTrigger>
      </TabsList>
      
      <div className="flex-1 overflow-hidden">
        <TabsContent value="month" className="h-full m-0 p-4">
          <DashboardMonthView
            currentDate={currentDate}
            events={events}
            onEventClick={onEventClick}
            onDateClick={onDateClick}
          />
        </TabsContent>
        
        <TabsContent value="week" className="h-full m-0">
          <WeekView
            currentDate={currentDate}
            events={events}
            onEventClick={onEventClick}
            onDateChange={onDateChange}
            onTimeSlotClick={onTimeSlotClick}
          />
        </TabsContent>
        
        <TabsContent value="day" className="h-full m-0">
          <DayView
            currentDate={currentDate}
            events={events}
            onEventClick={onEventClick}
            onTimeSlotClick={onTimeSlotClick}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
