import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventDialog } from './EventDialog';
import { useCalendarEvents, CalendarEvent } from '@/hooks/calendar/useCalendarEvents';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const weekDays = ["Sun", "M", "T", "W", "T", "F", "S"];

const monthDays = Array.from({ length: 35 }, (_, i) => {
  // This will create a simple grid - in a real app you'd use a proper date library
  const day = i < 7 ? (i + 1 > 4 ? i - 3 : "") : (i - 6);
  return day === "" ? "" : day;
});

export function CalendarWidget() {
  const { events, isLoading, addEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const { profile } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);
  const [tabValue, setTabValue] = useState("month");

  const handleAddEvent = () => {
    setEditingEvent(undefined);
    setDialogOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleSaveEvent = async (formData: any) => {
    if (editingEvent) {
      // Update existing event
      const success = await updateEvent(
        editingEvent.id, 
        {
          title: formData.title,
          description: formData.description,
          start_date: formData.date.toISOString(),
          end_date: formData.endDate?.toISOString() || formData.date.toISOString(),
          color: formData.color,
          is_public: formData.isPublic
        },
        formData.isHouseholdEvent
      );

      if (success) {
        toast({
          title: "Event Updated",
          description: "Your event has been updated successfully.",
        });
      }
    } else {
      // Add new event
      const newEvent = await addEvent({
        title: formData.title,
        description: formData.description,
        start_date: formData.date.toISOString(),
        end_date: formData.endDate?.toISOString() || formData.date.toISOString(),
        color: formData.color,
        is_household_event: formData.isHouseholdEvent,
        is_public: formData.isPublic
      });

      if (newEvent) {
        toast({
          title: "Event Added",
          description: `Your ${formData.isHouseholdEvent ? 'household' : 'personal'} event has been added successfully.`,
        });
      }
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent) return;
    
    const success = await deleteEvent(editingEvent.id, editingEvent.is_household_event);
    
    if (success) {
      toast({
        title: "Event Deleted",
        description: "Your event has been deleted successfully.",
      });
      setDialogOpen(false);
    }
  };

  const getEventsForDay = (day: number | string): CalendarEvent[] => {
    if (typeof day !== 'number') return [];
    
    // This is a simplified implementation. In a real app, you'd use a proper date library
    // to match events with real dates instead of just the day number.
    return events.filter(event => {
      const startDate = new Date(event.start_date);
      return startDate.getDate() === day;
    });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          <CardTitle>Family Calendar</CardTitle>
        </div>
        <Button size="sm" className="bg-primary" onClick={handleAddEvent}>
          <Plus className="h-4 w-4 mr-1" /> Add Event
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">March 2025</h3>
          <Tabs defaultValue="month" value={tabValue} onValueChange={setTabValue}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="calendar-grid">
          {weekDays.map((day, i) => (
            <div key={i} className="text-center py-2 font-medium text-sm">
              {day}
            </div>
          ))}
          
          {monthDays.map((day, i) => {
            const dayEvents = getEventsForDay(day);
            
            return (
              <div 
                key={i} 
                className={`calendar-day border ${day ? 'text-sm' : 'text-gray-200 bg-gray-50'}`}
              >
                {day}
                {dayEvents.length > 0 && (
                  <div className="calendar-day-events">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div 
                        key={event.id} 
                        className="calendar-day-event cursor-pointer hover:opacity-80"
                        style={{ backgroundColor: event.color || '#9b87f5' }}
                        onClick={() => handleEditEvent(event)}
                      >
                        <div className="flex items-center">
                          {event.is_household_event ? (
                            <span className="h-5 w-5 mr-1 flex items-center justify-center bg-white bg-opacity-20 rounded-full text-[10px]">F</span>
                          ) : (
                            <Avatar className="h-5 w-5 mr-1">
                              {profile?.avatar_url ? (
                                <AvatarImage src={profile.avatar_url} alt={profile.full_name || ""} />
                              ) : null}
                              <AvatarFallback className="text-[10px]">
                                {profile?.full_name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <span className="truncate text-xs text-white">{event.title}</span>
                        </div>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 mt-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <style>
          {`
          .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
          }
          .calendar-day {
            height: 60px;
            padding: 2px 4px;
            position: relative;
          }
          .calendar-day-events {
            margin-top: 2px;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .calendar-day-event {
            border-radius: 2px;
            padding: 1px 2px;
            color: white;
            font-size: 11px;
          }
          `}
        </style>
      </CardContent>

      <EventDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveEvent}
        event={editingEvent}
        isEditing={!!editingEvent}
        onDelete={editingEvent ? handleDeleteEvent : undefined}
      />
    </Card>
  );
}
