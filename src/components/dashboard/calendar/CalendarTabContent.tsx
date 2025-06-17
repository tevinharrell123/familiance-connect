
import React from 'react';
import { CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarEvent, CalendarViewType } from '@/types/calendar';
import { format, addMonths, subMonths, addDays, subDays, addWeeks, subWeeks } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { EnhancedWeekView } from '@/components/calendar/EnhancedWeekView';
import { EnhancedDayView } from '@/components/calendar/EnhancedDayView';
import { MonthView } from '@/components/calendar/MonthView';
import { Button } from '@/components/ui/button';

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
  onDayClick?: (date: Date) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

export function CalendarTabContent({
  currentDate,
  selectedView,
  events,
  isLoading,
  error,
  onDateChange,
  onViewChange,
  onEventClick,
  onDayClick,
  onTimeSlotClick,
  days,
}: CalendarTabContentProps) {
  const handlePrevious = () => {
    if (selectedView === 'month') {
      onDateChange(subMonths(currentDate, 1));
    } else if (selectedView === 'week') {
      onDateChange(subWeeks(currentDate, 1));
    } else if (selectedView === 'day') {
      onDateChange(subDays(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (selectedView === 'month') {
      onDateChange(addMonths(currentDate, 1));
    } else if (selectedView === 'week') {
      onDateChange(addWeeks(currentDate, 1));
    } else if (selectedView === 'day') {
      onDateChange(addDays(currentDate, 1));
    }
  };

  return (
    <CardContent className="p-0 h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="text-lg font-semibold">
            {selectedView === 'day' 
              ? format(currentDate, 'MMMM d, yyyy')
              : selectedView === 'week'
                ? `Week of ${format(currentDate, 'MMM d, yyyy')}`
                : format(currentDate, 'MMMM yyyy')}
          </h3>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs defaultValue="month" value={selectedView} onValueChange={onViewChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {selectedView === 'month' && (
          <div className="p-4 h-full">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-[400px] w-full" />
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <p>Error loading calendar events</p>
              </div>
            ) : (
              <MonthView 
                currentDate={currentDate}
                events={events}
                onEventClick={onEventClick}
                onDayClick={onDayClick}
              />
            )}
          </div>
        )}
        
        {selectedView === 'week' && (
          <EnhancedWeekView 
            currentDate={currentDate} 
            events={events}
            isLoading={isLoading}
            onEventClick={onEventClick}
            onTimeSlotClick={onTimeSlotClick}
          />
        )}
        
        {selectedView === 'day' && (
          <EnhancedDayView 
            currentDate={currentDate} 
            events={events}
            isLoading={isLoading}
            onEventClick={onEventClick}
            onTimeSlotClick={onTimeSlotClick}
          />
        )}
      </div>
    </CardContent>
  );
}
