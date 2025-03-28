
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  
  // Skip rendering very short spans - they'll be shown in the day cells
  if (span <= 0) return null;
  
  const userInitials = event.user_profile?.full_name
    ? event.user_profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?';

  return (
    <div 
      className="absolute flex items-center rounded-md px-2 text-xs truncate cursor-pointer hover:opacity-90"
      style={{
        backgroundColor: event.color || '#7B68EE',
        color: 'white',
        gridRow: weekIdx + 1,
        gridColumn: `${startIdx + 1} / span ${span}`,
        zIndex: 10,
        height: '22px',
        margin: '2px 0',
        left: `${startIdx * (100/7)}%`,
        width: `calc(${span * (100/7)}% - 4px)`,
        top: `${30 + (weekIdx * 80)}px`
      }}
      onClick={() => onClick(event)}
    >
      <Avatar className="h-4 w-4 mr-1">
        {event.user_profile?.avatar_url ? (
          <AvatarImage src={event.user_profile.avatar_url} alt={event.user_profile.full_name || ''} />
        ) : null}
        <AvatarFallback className="text-[8px]">{userInitials}</AvatarFallback>
      </Avatar>
      <span className="truncate">{event.title}</span>
    </div>
  );
}
