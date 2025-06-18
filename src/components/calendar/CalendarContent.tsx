
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { EnhancedWeekView } from '@/components/calendar/EnhancedWeekView';
import { EnhancedDayView } from '@/components/calendar/EnhancedDayView';
import { MonthView } from '@/components/calendar/MonthView';
import { MobileMonthView } from '@/components/calendar/MobileMonthView';
import { CalendarEvent } from '@/types/calendar';
import { useIsMobile } from '@/hooks/use-mobile';

interface CalendarContentProps {
  view: 'day' | 'week' | 'month';
  selectedDate: Date;
  filteredEvents: CalendarEvent[];
  isLoading: boolean;
  onSelectEvent: (event: CalendarEvent) => void;
  onDayClick: (date: Date) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
  onQuickEventCreate: (date: Date, template?: string) => void;
  onEventEdit: (event: CalendarEvent) => void;
  onEventDelete: (event: CalendarEvent) => void;
  onEventDuplicate: (event: CalendarEvent) => void;
}

export function CalendarContent({
  view,
  selectedDate,
  filteredEvents,
  isLoading,
  onSelectEvent,
  onDayClick,
  onTimeSlotClick,
  onQuickEventCreate,
  onEventEdit,
  onEventDelete,
  onEventDuplicate
}: CalendarContentProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex-1 overflow-hidden">
      <TabsContent value="month" className={`h-full m-0 p-4 ${view === 'month' ? 'block' : 'hidden'}`}>
        {isMobile ? (
          <MobileMonthView
            currentDate={selectedDate}
            events={filteredEvents}
            onEventClick={onSelectEvent}
            onDayClick={onDayClick}
          />
        ) : (
          <MonthView
            currentDate={selectedDate}
            events={filteredEvents}
            onEventClick={onSelectEvent}
            onDayClick={onDayClick}
            onQuickEventCreate={onQuickEventCreate}
            onEventEdit={onEventEdit}
            onEventDelete={onEventDelete}
            onEventDuplicate={onEventDuplicate}
          />
        )}
      </TabsContent>
      
      <TabsContent value="week" className={`h-full m-0 ${view === 'week' ? 'block' : 'hidden'}`}>
        <EnhancedWeekView
          currentDate={selectedDate}
          events={filteredEvents}
          isLoading={isLoading}
          onEventClick={onSelectEvent}
          onTimeSlotClick={onTimeSlotClick}
        />
      </TabsContent>
      
      <TabsContent value="day" className={`h-full m-0 ${view === 'day' ? 'block' : 'hidden'}`}>
        <EnhancedDayView
          currentDate={selectedDate}
          events={filteredEvents}
          isLoading={isLoading}
          onEventClick={onSelectEvent}
          onTimeSlotClick={onTimeSlotClick}
        />
      </TabsContent>
    </div>
  );
}
