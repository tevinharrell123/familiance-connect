
import React from 'react';
import { format, addMonths, subMonths, addDays, subDays, addWeeks, subWeeks } from 'date-fns';
import { CalendarIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarViewType } from '@/types/calendar';

interface CalendarHeaderProps {
  currentDate: Date;
  onAddEvent: () => void;
  onDateChange: (date: Date) => void;
  selectedView: CalendarViewType;
}

export function CalendarHeader({ currentDate, onAddEvent, onDateChange, selectedView }: CalendarHeaderProps) {
  const handlePrevious = () => {
    switch (selectedView) {
      case 'day':
        onDateChange(subDays(currentDate, 1));
        break;
      case 'week':
        onDateChange(subWeeks(currentDate, 1));
        break;
      case 'month':
      default:
        onDateChange(subMonths(currentDate, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (selectedView) {
      case 'day':
        onDateChange(addDays(currentDate, 1));
        break;
      case 'week':
        onDateChange(addWeeks(currentDate, 1));
        break;
      case 'month':
      default:
        onDateChange(addMonths(currentDate, 1));
        break;
    }
  };

  // Format the header text based on the selected view
  const getHeaderText = () => {
    switch (selectedView) {
      case 'day':
        return format(currentDate, 'MMMM d, yyyy');
      case 'week':
        return format(currentDate, 'MMMM yyyy');
      case 'month':
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  };

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
      
      <div className="px-6 month-navigation">
        <Button variant="ghost" size="icon" onClick={handlePrevious}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <h3 className="text-lg font-semibold">{getHeaderText()}</h3>
        
        <Button variant="ghost" size="icon" onClick={handleNext}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
}
