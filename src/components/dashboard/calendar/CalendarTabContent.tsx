import React from 'react';
import { CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarEvent, CalendarViewType } from '@/types/calendar';
import { format, addMonths, subMonths, addDays, subDays, addWeeks, subWeeks } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { WeekView } from '@/components/calendar/WeekView';
import { DayView } from '@/components/calendar/DayView';
import { DashboardMonthView } from '@/components/calendar/DashboardMonthView';
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
    <CardContent className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
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
          
          <TabsContent value="month" className="mt-2">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-[300px] w-full" />
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <p>Error loading calendar events</p>
              </div>
            ) : (
              <DashboardMonthView 
                currentDate={currentDate}
                events={events}
                onEventClick={onEventClick}
              />
            )}
          </TabsContent>
          
          <TabsContent value="week">
            <WeekView 
              currentDate={currentDate} 
              events={events}
              onEventClick={onEventClick}
            />
          </TabsContent>
          
          <TabsContent value="day">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-[300px] w-full" />
              </div>
            ) : error ? (
              <div className="text-center p-4 text-red-500 flex flex-col items-center">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <p>Error loading calendar events</p>
              </div>
            ) : (
              <DayView 
                currentDate={currentDate} 
                events={events} 
                onEventClick={onEventClick}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CardContent>
  );
}
