
import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface CalendarHeaderProps {
  currentDate: Date;
  onAddEvent: () => void;
  onDateChange?: (date: Date) => void;
}

export function CalendarHeader({ currentDate, onAddEvent, onDateChange }: CalendarHeaderProps) {
  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <CardTitle>Family Calendar</CardTitle>
        </div>
        <Button size="sm" className="bg-primary" onClick={onAddEvent}>
          <Plus className="h-4 w-4 mr-1" /> Add Event
        </Button>
      </CardHeader>
    </>
  );
}
