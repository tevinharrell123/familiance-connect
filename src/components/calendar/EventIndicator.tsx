
import React from 'react';
import { CalendarEvent } from '@/types/calendar';

interface EventIndicatorProps {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
}

export function EventIndicator({ event, onClick }: EventIndicatorProps) {
  const backgroundColor = event.color || '#7B68EE';
  
  return (
    <div
      className="text-xs mb-1 rounded-md px-1 py-0.5 truncate single-day-event"
      style={{ 
        backgroundColor: `${backgroundColor}20`, // 20% opacity
        borderLeft: `3px solid ${backgroundColor}`,
        color: backgroundColor,
      }}
      onClick={onClick}
    >
      {event.title}
    </div>
  );
}
