
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { parseISO, differenceInDays } from 'date-fns';

interface EventIndicatorProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
}

export function EventIndicator({ event, onClick }: EventIndicatorProps) {
  const isMultiDay = differenceInDays(parseISO(event.end_date), parseISO(event.start_date)) > 0;
  
  // Use different styles for multi-day and single-day events
  const style = {
    backgroundColor: isMultiDay ? '#8B5CF6' : (event.color || '#7B68EE'),
    borderRadius: '4px',
    padding: '2px 4px',
    margin: '1px 0',
    fontSize: '0.7rem',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'white',
    cursor: 'pointer',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(event);
  };

  return (
    <div 
      className="single-day-event" 
      style={style} 
      onClick={handleClick}
    >
      {event.title}
    </div>
  );
}
