
import React from 'react';
import { format, addMonths, subMonths, addDays, subDays, addWeeks, subWeeks } from 'date-fns';
import { CalendarIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface CalendarHeaderProps {
  currentDate: Date;
  onAddEvent: () => void;
  onDateChange?: (date: Date) => void;
}

export function CalendarHeader({ currentDate, onAddEvent, onDateChange }: CalendarHeaderProps) {
  const handlePrevious = () => {
    if (onDateChange) {
      onDateChange(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (onDateChange) {
      onDateChange(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    if (onDateChange) {
      onDateChange(new Date());
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center">
        <Button variant="outline" size="icon" onClick={handlePrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="px-2 font-medium">
          {format(currentDate, 'MMMM yyyy')}
        </div>
        <Button variant="outline" size="icon" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Button variant="outline" size="sm" onClick={handleToday}>
        Today
      </Button>
    </div>
  );
}
