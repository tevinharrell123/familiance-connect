
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from '@/hooks/use-mobile';

interface MultiDayEventProps {
  event: CalendarEvent;
  startIdx: number;
  endIdx: number;
  weekIdx: number;
  onClick: (event: CalendarEvent) => void;
}

export function MultiDayEvent({ 
  event, 
  startIdx, 
  endIdx, 
  weekIdx, 
  onClick 
}: MultiDayEventProps) {
  const span = endIdx - startIdx + 1;
  const isMobile = useIsMobile();
  
  // Skip rendering very short spans - they'll be shown in the day cells
  if (span <= 0) return null;
  
  const userInitials = event.user_profile?.full_name
    ? event.user_profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Multi-day event clicked:', event.id);
    onClick(event);
  };

  // Calculate responsive dimensions based on screen size
  let rowHeight, eventHeight, topOffset, fontSize, avatarSize;
  
  if (window.innerWidth <= 480) {
    // Extra small screens
    rowHeight = '50px';
    eventHeight = '16px';
    topOffset = '22px';
    fontSize = '8px';
    avatarSize = '3';
  } else if (window.innerWidth <= 640) {
    // Small screens
    rowHeight = '60px';
    eventHeight = '18px';
    topOffset = '25px';
    fontSize = '9px';
    avatarSize = '3';
  } else if (window.innerWidth <= 768) {
    // Medium screens
    rowHeight = '70px';
    eventHeight = '20px';
    topOffset = '28px';
    fontSize = '10px';
    avatarSize = '4';
  } else {
    // Large screens
    rowHeight = '80px';
    eventHeight = '22px';
    topOffset = '30px';
    fontSize = '11px';
    avatarSize = '4';
  }
  
  const topPosition = `calc(${weekIdx} * ${rowHeight} + ${topOffset})`;

  return (
    <div 
      className="absolute flex items-center rounded-md px-1 truncate cursor-pointer hover:opacity-90 multi-day-event"
      style={{
        backgroundColor: event.color || '#7B68EE',
        color: 'white',
        height: eventHeight,
        margin: '2px 0',
        left: `${startIdx * (100/7)}%`,
        width: `calc(${span * (100/7)}% - 4px)`,
        top: topPosition,
        zIndex: 10,
        fontSize: fontSize,
      }}
      onClick={handleClick}
    >
      <Avatar className={`h-${avatarSize} w-${avatarSize} mr-1`} style={{ height: avatarSize + 'px', width: avatarSize + 'px', minWidth: avatarSize + 'px' }}>
        {event.user_profile?.avatar_url ? (
          <AvatarImage src={event.user_profile.avatar_url} alt={event.user_profile.full_name || ''} />
        ) : null}
        <AvatarFallback style={{ fontSize: isMobile ? '7px' : '8px' }}>{userInitials}</AvatarFallback>
      </Avatar>
      <span className="truncate">{event.title}</span>
    </div>
  );
}
