
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { parseISO, format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface MultiDayEventProps {
  event: CalendarEvent;
  startIdx: number;
  endIdx: number;
  weekIdx: number;
  rowPosition: number;
  onClick: (event: CalendarEvent) => void;
}

export function MultiDayEvent({ 
  event, 
  startIdx, 
  endIdx, 
  weekIdx, 
  rowPosition = 0, 
  onClick 
}: MultiDayEventProps) {
  const isMobile = useIsMobile();
  
  // Calculate width based on days spanned
  const span = endIdx - startIdx + 1;
  const widthPercent = (span / 7) * 100;
  const leftPercent = (startIdx / 7) * 100;
  
  // Calculate top position based on week index, row position and a fixed height for multi-day events
  const multiDayEventHeight = isMobile ? 16 : 22;
  const headerHeight = 32; // Height of the day header
  const eventMargin = 2; // Margin between events
  const weekHeight = isMobile ? 50 : 80; // Height of each week row
  const weekOffset = weekIdx * weekHeight;
  const rowOffset = rowPosition * (multiDayEventHeight + eventMargin);
  const topOffset = weekOffset + headerHeight + rowOffset;
  
  const backgroundColor = event.color || '#7B68EE';
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Multi-day event clicked:', event.id);
    onClick(event);
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    console.log('Multi-day event touched:', event.id);
    onClick(event);
  };
  
  // Format date range for display
  const eventStart = parseISO(event.start_date);
  const eventEnd = parseISO(event.end_date);
  
  const displayTitle = isMobile 
    ? event.title 
    : `${event.title} (${format(eventStart, 'MMM d')}${
        format(eventStart, 'MMM d') !== format(eventEnd, 'MMM d') 
          ? ` - ${format(eventEnd, 'MMM d')}` 
          : ''
      })`;
  
  return (
    <div 
      className="multi-day-event"
      style={{
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        top: `${topOffset}px`,
        backgroundColor,
        color: '#fff',
        height: `${multiDayEventHeight}px`,
        lineHeight: `${multiDayEventHeight}px`,
        zIndex: 10 + rowPosition,
      }}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
    >
      <span className="px-1">{displayTitle}</span>
    </div>
  );
}
