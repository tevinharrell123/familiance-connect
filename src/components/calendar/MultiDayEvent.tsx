
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { parseISO, format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface MultiDayEventProps {
  event: CalendarEvent;
  startIdx: number;
  endIdx: number;
  weekIdx: number;
  onClick: (event: CalendarEvent) => void;
}

export function MultiDayEvent({ event, startIdx, endIdx, weekIdx, onClick }: MultiDayEventProps) {
  const isMobile = useIsMobile();
  
  // Calculate width based on days spanned
  const span = endIdx - startIdx + 1;
  const widthPercent = (span / 7) * 100;
  const leftPercent = (startIdx / 7) * 100;
  
  // Calculate top position based on week index and a fixed height for multi-day events
  const multiDayEventHeight = isMobile ? 14 : 18;
  const headerHeight = 32; // Height of the day header
  const topOffset = (weekIdx * 1.5 * multiDayEventHeight) + headerHeight;
  
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
  
  // Format time if needed
  const eventStart = parseISO(event.start_date);
  const eventEnd = parseISO(event.end_date);
  
  // Use display title based on device size
  let displayTitle;
  if (isMobile) {
    displayTitle = event.title;
  } else {
    // Add date range info for desktop
    displayTitle = `${event.title} (${format(eventStart, 'MMM d')}-${format(eventEnd, 'MMM d')})`;
  }
  
  console.log(`Rendering event: ${event.title}, left: ${leftPercent}%, width: ${widthPercent}%, weekIdx: ${weekIdx}`);
  
  return (
    <div 
      className="multi-day-event"
      style={{
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        top: `${topOffset}px`,
        backgroundColor: `${backgroundColor}`,
        color: '#fff',
        height: `${multiDayEventHeight}px`,
        lineHeight: `${multiDayEventHeight}px`
      }}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
    >
      {displayTitle}
    </div>
  );
}
