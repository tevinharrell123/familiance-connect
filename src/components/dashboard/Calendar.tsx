
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardMonthView } from '@/components/calendar/DashboardMonthView';
import { CalendarFilters } from '@/components/calendar/CalendarFilters';
import { CalendarEvent } from '@/types/calendar';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { useFamilyMembers } from '@/hooks/household/useFamilyMembers';
import { useChildProfiles } from '@/hooks/household/useChildProfiles';
import { EventDetailsDialog } from '@/components/calendar/EventDetailsDialog';
import { checkNotificationPermission } from '@/utils/notificationUtils';
import { toast } from '@/components/ui/use-toast';

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<'month'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);
  
  const { events, isLoading, refetch, manualRefresh, isRefreshing } = useCalendarEvents();
  const { members: householdMembers = [] } = useFamilyMembers();
  const { childProfiles } = useChildProfiles();

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

  // Filter events based on selected persons
  const filteredEvents = events?.filter(event => {
    if (selectedPersonIds.length === 0) return true;
    
    // Check if event is assigned to any of the selected persons
    if (event.assigned_to_child && selectedPersonIds.includes(event.assigned_to_child)) {
      return true;
    }
    
    // Check if event creator is in selected persons (for user events)
    if (event.user_id && selectedPersonIds.includes(event.user_id)) {
      return true;
    }
    
    // For household events, show if any person is selected (since they affect everyone)
    if (event.is_household_event && selectedPersonIds.length > 0) {
      return true;
    }
    
    return false;
  }) || [];

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

  const handlePersonToggle = (personId: string) => {
    setSelectedPersonIds(prev => 
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const handleClearFilters = () => {
    setSelectedPersonIds([]);
  };

  const handleManualRefresh = async () => {
    try {
      await manualRefresh();
      toast({
        title: "Calendar refreshed",
        description: "Events have been updated with the latest data."
      });
    } catch (error) {
      console.error("Manual refresh failed:", error);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
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
        <CalendarFilters
          householdMembers={householdMembers || []}
          childProfiles={childProfiles}
          selectedPersonIds={selectedPersonIds}
          onPersonToggle={handlePersonToggle}
          onClearFilters={handleClearFilters}
        />
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <Tabs defaultValue="month">
          <TabsContent value="month" className="mt-0">
            <DashboardMonthView 
              currentDate={currentDate}
              events={filteredEvents || []}
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
