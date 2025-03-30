
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
  const multiDayEventHeight = isMobile ? 14 : 22; // Reduced height on mobile
  const headerHeight = isMobile ? 24 : 32; // Reduced header height on mobile
  const eventMargin = isMobile ? 1 : 2; // Reduced margin on mobile
  const weekHeight = isMobile ? 50 : 80; // Week height matches the calendar day cell height
  
  const weekOffset = weekIdx * weekHeight;
  const rowOffset = rowPosition * (multiDayEventHeight + eventMargin);
  const topOffset = weekOffset + headerHeight + rowOffset;
  
  const backgroundColor = event.color || '#7B68EE';
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(event);
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    onClick(event);
  };
  
  // Format date range for display
  const eventStart = parseISO(event.start_date);
  const eventEnd = parseISO(event.end_date);
  
  // On mobile, just show the title to save space
  const displayTitle = isMobile 
    ? event.title.substring(0, 12) + (event.title.length > 12 ? '...' : '')
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
        fontSize: isMobile ? '0.6rem' : '0.7rem', // Smaller font on mobile
      }}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
    >
      <span className="px-1 truncate block">{displayTitle}</span>
    </div>
  );
}
