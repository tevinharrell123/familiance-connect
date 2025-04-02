
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface EventIndicatorProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
}

export function EventIndicator({ event, onClick }: EventIndicatorProps) {
  // Handle cases where user_profile or full_name might be null or undefined
  const fullName = event.user_profile?.full_name || '';
  const userInitials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?';
      
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

  return (
    <div 
      key={event.id} 
      className="flex items-center text-xs rounded-full px-1 py-0 mt-0.5 truncate cursor-pointer hover:opacity-80 single-day-event"
      style={{ 
        backgroundColor: `${event.color || '#7B68EE'}30`,
        fontSize: '9px',
        lineHeight: '14px'
      }}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
    >
      <Avatar className="h-2 w-2 mr-0.5">
        {event.user_profile?.avatar_url ? (
          <AvatarImage 
            src={event.user_profile.avatar_url} 
            alt={event.user_profile.full_name || 'User'} 
          />
        ) : null}
        <AvatarFallback className="text-[6px]">{userInitials}</AvatarFallback>
      </Avatar>
      <span className="truncate text-[9px]">{event.title}</span>
    </div>
  );
}
