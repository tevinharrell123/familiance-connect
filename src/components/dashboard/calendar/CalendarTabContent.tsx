
import React from 'react';
import { CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarEvent, CalendarViewType } from '@/types/calendar';
import { format, addMonths, subMonths, addDays, subDays, addWeeks, subWeeks } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { MonthView } from '@/components/calendar/MonthView';
import { WeekView } from '@/components/calendar/WeekView';
import { DayView } from '@/components/calendar/DayView';
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
  days, 
  events, 
  isLoading, 
  error, 
  selectedView, 
  onViewChange,
  onEventClick,
  onDateChange,
  onDayClick
}: CalendarTabContentProps) {
  // Handle navigation based on current view
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
    <CardContent>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
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
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
        
        <Tabs defaultValue="month" value={selectedView} onValueChange={onViewChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>
          
          <TabsContent value="month" className="mt-4">
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
              <MonthView 
                days={days} 
                events={events} 
                currentMonth={currentDate} 
                onEventClick={onEventClick} 
                onDayClick={onDayClick}
              />
            )}
          </TabsContent>
          
          <TabsContent value="day">
            <DayView 
              currentDate={currentDate} 
              events={events} 
              onEventClick={onEventClick}
            />
          </TabsContent>
          
          <TabsContent value="week">
            <WeekView 
              currentDate={currentDate} 
              events={events}
              onEventClick={onEventClick}
            />
          </TabsContent>
        </Tabs>
      </div>
    </CardContent>
  );
}
