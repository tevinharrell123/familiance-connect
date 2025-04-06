
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight, ChevronLeft, Calendar } from 'lucide-react';
import { parseISO, format, differenceInDays } from 'date-fns';

interface EventIndicatorProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  isMultiDay?: boolean;
  isFirstDay?: boolean;
  isLastDay?: boolean;
}

export function EventIndicator({ 
  event, 
  onClick,
  isMultiDay = false,
  isFirstDay = true,
  isLastDay = true
}: EventIndicatorProps) {
  // Handle cases where user_profile or full_name might be null or undefined
  const fullName = event.user_profile?.full_name || '';
  const userInitials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?';
  
  // Calculate duration for multi-day events
  const eventStart = parseISO(event.start_date);
  const eventEnd = parseISO(event.end_date);
  const duration = differenceInDays(eventEnd, eventStart) + 1;
      
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Event indicator clicked:', event.id);
    onClick(event);
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Event indicator touched:', event.id);
    onClick(event);
  };

  // Adjust styling for multi-day events
  const getBorderRadius = () => {
    if (!isMultiDay) return 'rounded-md';
    if (isFirstDay && isLastDay) return 'rounded-md';
    if (isFirstDay) return 'rounded-l-md rounded-r-none';
    if (isLastDay) return 'rounded-r-md rounded-l-none';
    return 'rounded-none';
  };

  // Truncate title based on position in multi-day event
  const getDisplayTitle = () => {
    const title = event.title;
    const maxLength = isMultiDay ? (isFirstDay ? 8 : 6) : 12;
    
    if (title.length <= maxLength) return title;
    return `${title.substring(0, maxLength)}...`;
  };

  // Get appropriate icon or text for start/end of multi-day events
  const getMultiDayIndicator = () => {
    if (!isMultiDay) return null;
    
    if (isFirstDay) {
      return <ChevronRight className="h-2 w-2 ml-1" />;
    } else if (isLastDay) {
      return <ChevronLeft className="h-2 w-2 mr-1" />;
    } else {
      return (
        <span className="text-[7px] font-medium mx-0.5">•••</span>
      );
    }
  };

  return (
    <div 
      key={event.id} 
      className={`flex items-center text-xs px-1.5 py-0.5 mt-0.5 truncate cursor-pointer hover:opacity-80 single-day-event ${getBorderRadius()}`}
      style={{ 
        backgroundColor: `${event.color || '#7B68EE'}40`,
        border: `1px solid ${event.color || '#7B68EE'}80`,
        color: `${event.color || '#7B68EE'}`,
        fontWeight: 500,
        fontSize: '10px',
        lineHeight: '14px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
    >
      {isMultiDay && !isFirstDay && getMultiDayIndicator()}
      
      {isFirstDay && (
        <Avatar className="h-3 w-3 mr-1 flex-shrink-0">
          {event.user_profile?.avatar_url ? (
            <AvatarImage 
              src={event.user_profile.avatar_url} 
              alt={event.user_profile.full_name || 'User'} 
            />
          ) : null}
          <AvatarFallback className="text-[7px]">{userInitials}</AvatarFallback>
        </Avatar>
      )}
      
      <span className="truncate text-[10px] font-medium">
        {getDisplayTitle()}
      </span>
      
      {isMultiDay && isFirstDay && (
        <>
          {getMultiDayIndicator()}
          {duration > 1 && (
            <span className="text-[8px] ml-0.5 flex-shrink-0">
              {duration}d
            </span>
          )}
        </>
      )}
    </div>
  );
}
