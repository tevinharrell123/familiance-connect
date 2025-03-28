
import React from 'react';
import { CalendarEvent } from '@/types/calendar';

interface DayViewProps {
  currentDate: Date;
  events?: CalendarEvent[];
}

export function DayView({ currentDate, events = [] }: DayViewProps) {
  return (
    <div className="p-4 text-center">
      <p>Day view will be implemented in a future update.</p>
    </div>
  );
}
