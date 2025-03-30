
import React, { useEffect, useState } from 'react';
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
  const [dimensions, setDimensions] = useState({
    rowHeight: '80px',
    eventHeight: '22px',
    topOffset: '30px',
    fontSize: '11px',
    avatarSize: 4
  });
  
  // Skip rendering very short spans - they'll be shown in the day cells
  if (span <= 0) return null;
  
  const userInitials = event.user_profile?.full_name
    ? event.user_profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?';

  // Update dimensions on window resize
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      
      if (width <= 480) {
        // Extra small screens
        setDimensions({
          rowHeight: '50px',
          eventHeight: '16px',
          topOffset: '20px',
          fontSize: '8px',
          avatarSize: 2
        });
      } else if (width <= 640) {
        // Small screens
        setDimensions({
          rowHeight: '60px',
          eventHeight: '18px',
          topOffset: '22px',
          fontSize: '9px',
          avatarSize: 3
        });
      } else if (width <= 768) {
        // Medium screens
        setDimensions({
          rowHeight: '70px',
          eventHeight: '20px',
          topOffset: '26px',
          fontSize: '10px',
          avatarSize: 3
        });
      } else {
        // Large screens
        setDimensions({
          rowHeight: '80px',
          eventHeight: '22px',
          topOffset: '30px',
          fontSize: '11px',
          avatarSize: 4
        });
      }
    };

    // Initialize dimensions
    updateDimensions();
    
    // Add event listener
    window.addEventListener('resize', updateDimensions);
    
    // Clean up
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Multi-day event clicked:', event.id);
    onClick(event);
  };
  
  const topPosition = `calc(${weekIdx} * ${dimensions.rowHeight} + ${dimensions.topOffset})`;

  return (
    <div 
      className="absolute flex items-center rounded-md px-1 truncate cursor-pointer hover:opacity-90 multi-day-event"
      style={{
        backgroundColor: event.color || '#7B68EE',
        color: 'white',
        height: dimensions.eventHeight,
        margin: '2px 0',
        left: `${startIdx * (100/7)}%`,
        width: `calc(${span * (100/7)}% - 4px)`,
        top: topPosition,
        zIndex: 10,
        fontSize: dimensions.fontSize,
      }}
      onClick={handleClick}
    >
      {dimensions.avatarSize > 2 && (
        <Avatar 
          className="mr-1"
          style={{ 
            height: `${dimensions.avatarSize}px`, 
            width: `${dimensions.avatarSize}px`, 
            minWidth: `${dimensions.avatarSize}px`,
            marginRight: '2px'
          }}
        >
          {event.user_profile?.avatar_url ? (
            <AvatarImage src={event.user_profile.avatar_url} alt={event.user_profile.full_name || ''} />
          ) : null}
          <AvatarFallback style={{ fontSize: `${Math.max(dimensions.avatarSize - 1, 6)}px` }}>
            {userInitials}
          </AvatarFallback>
        </Avatar>
      )}
      <span className="truncate whitespace-nowrap">{event.title}</span>
    </div>
  );
}
