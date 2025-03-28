
import React from 'react';
import { CalendarEvent } from '@/types/calendar';

interface WeekViewProps {
  currentDate: Date;
  events?: CalendarEvent[];
}

export function WeekView({ currentDate, events = [] }: WeekViewProps) {
  return (
    <div className="p-4 text-center">
      <p>Week view will be implemented in a future update.</p>
    </div>
  );
}
