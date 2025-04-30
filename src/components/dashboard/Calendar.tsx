
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardMonthView } from '@/components/calendar/DashboardMonthView';
import { CalendarEvent } from '@/types/calendar';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { EventDetailsDialog } from '@/components/calendar/EventDetailsDialog';
import { checkNotificationPermission } from '@/utils/notificationUtils';
import { toast } from '@/components/ui/use-toast';

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<'month'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  
  const { events, isLoading, refetch } = useCalendarEvents();

  // Check notification permissions on component mount
  useEffect(() => {
    const checkPermissions = async () => {
      const hasPermission = await checkNotificationPermission();
      if (!hasPermission) {
        toast({
          title: "Notifications",
          description: "Enable notifications to get reminders for your events.",
          variant: "default",
        });
      }
    };
    
    checkPermissions();
  }, []);

  const handlePrevious = () => {
    setCurrentDate(prev => subDays(prev, 30));
  };

  const handleNext = () => {
    setCurrentDate(prev => addDays(prev, 30));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailsDialogOpen(true);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {format(currentDate, 'MMMM yyyy')}
        </p>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <Tabs defaultValue="month">
          <TabsContent value="month" className="mt-0">
            <DashboardMonthView 
              currentDate={currentDate}
              events={events || []}
              onEventClick={handleEventClick}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {selectedEvent && (
        <EventDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          event={selectedEvent}
          onEditClick={() => {}}
          onDeleteClick={() => {}}
        />
      )}
    </Card>
  );
}
