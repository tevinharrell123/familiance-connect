
import React from 'react';
import { CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarEvent, CalendarViewType } from '@/types/calendar';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { MonthView } from '@/components/calendar/MonthView';
import { WeekView } from '@/components/calendar/WeekView';
import { DayView } from '@/components/calendar/DayView';

interface CalendarTabContentProps {
  currentDate: Date;
  days: Date[];
  events: CalendarEvent[];
  isLoading: boolean;
  error: any;
  selectedView: CalendarViewType;
  onViewChange: (view: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarTabContent({ 
  currentDate, 
  days, 
  events, 
  isLoading, 
  error, 
  selectedView, 
  onViewChange,
  onEventClick 
}: CalendarTabContentProps) {
  return (
    <CardContent>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">{format(currentDate, 'MMMM yyyy')}</h3>
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
              />
            )}
          </TabsContent>
          
          <TabsContent value="day">
            <DayView currentDate={currentDate} events={events} />
          </TabsContent>
          
          <TabsContent value="week">
            <WeekView currentDate={currentDate} events={events} />
          </TabsContent>
        </Tabs>
      </div>
    </CardContent>
  );
}
