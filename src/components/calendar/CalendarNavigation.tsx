
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';

interface CalendarNavigationProps {
  selectedDate: Date;
  view: 'day' | 'week' | 'month';
  onDateChange: (date: Date) => void;
}

export function CalendarNavigation({ selectedDate, view, onDateChange }: CalendarNavigationProps) {
  const handlePrevious = () => {
    let newDate: Date;
    switch (view) {
      case 'day':
        newDate = subDays(selectedDate, 1);
        break;
      case 'week':
        newDate = subWeeks(selectedDate, 1);
        break;
      case 'month':
        newDate = subMonths(selectedDate, 1);
        break;
      default:
        return;
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    let newDate: Date;
    switch (view) {
      case 'day':
        newDate = addDays(selectedDate, 1);
        break;
      case 'week':
        newDate = addWeeks(selectedDate, 1);
        break;
      case 'month':
        newDate = addMonths(selectedDate, 1);
        break;
      default:
        return;
    }
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const getDateLabel = () => {
    switch (view) {
      case 'day':
        return format(selectedDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        return format(selectedDate, 'MMMM yyyy');
      case 'month':
        return format(selectedDate, 'MMMM yyyy');
      default:
        return format(selectedDate, 'MMMM yyyy');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleToday}
        className="hidden sm:flex"
      >
        Today
      </Button>
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="min-w-0 px-2 text-center">
          <span className="text-sm font-medium whitespace-nowrap">
            {getDateLabel()}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
