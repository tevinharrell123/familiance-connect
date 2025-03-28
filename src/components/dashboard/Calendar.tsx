
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Event = {
  id: number;
  title: string;
  day: number;
  person: {
    name: string;
    avatar?: string;
    initials: string;
  };
};

const weekDays = ["Sun", "M", "T", "W", "T", "F", "S"];

const events: Event[] = [
  {
    id: 1,
    title: "Book Club",
    day: 2,
    person: {
      name: "Sarah",
      avatar: "/lovable-uploads/2dd00b84-e39d-4dea-a414-c955a711e06b.png",
      initials: "S",
    }
  },
  {
    id: 2,
    title: "Dentist",
    day: 11,
    person: {
      name: "Ethan",
      initials: "E",
    }
  },
  {
    id: 3,
    title: "Movie Night",
    day: 9,
    person: {
      name: "Jason",
      initials: "J",
    }
  }
];

const monthDays = Array.from({ length: 35 }, (_, i) => {
  // This will create a simple grid - in a real app you'd use a proper date library
  const day = i < 7 ? (i + 1 > 4 ? i - 3 : "") : (i - 6);
  return day === "" ? "" : day;
});

export function CalendarWidget() {
  const getEventForDay = (day: number | string): Event | null => {
    if (typeof day !== 'number') return null;
    return events.find(event => event.day === day) || null;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          <CardTitle>Family Calendar</CardTitle>
        </div>
        <Button size="sm" className="bg-primary">
          <Plus className="h-4 w-4 mr-1" /> Add Event
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">March 2025</h3>
          <Tabs defaultValue="month">
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
            const event = getEventForDay(day);
            
            return (
              <div 
                key={i} 
                className={`calendar-day border ${day ? 'text-sm' : 'text-gray-200 bg-gray-50'}`}
              >
                {day}
                {event && (
                  <div className="calendar-day-event">
                    <div className="flex items-center">
                      <Avatar className="h-5 w-5 mr-1">
                        {event.person.avatar ? (
                          <AvatarImage src={event.person.avatar} alt={event.person.name} />
                        ) : null}
                        <AvatarFallback className="text-[10px]">{event.person.initials}</AvatarFallback>
                      </Avatar>
                      {event.title}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
