
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
  if (span <= 1) return null;
  
  const userInitials = event.user_profile?.full_name
    ? event.user_profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?';

  return (
    <div 
      className="multi-day-event absolute flex items-center rounded-md px-1 text-xs truncate cursor-pointer hover:opacity-90"
      style={{
        backgroundColor: event.color || '#7B68EE',
        color: 'white',
        gridRow: `${weekIdx + 2}`, // +2 to account for header row
        gridColumn: `${startIdx + 1} / span ${span}`,
        top: `${(weekIdx * 100) + 30}px`, // Positioning based on week
        height: '20px',
        zIndex: 10
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
    >
      <Avatar className="h-3 w-3 mr-1">
        {event.user_profile?.avatar_url ? (
          <AvatarImage src={event.user_profile.avatar_url} alt={event.user_profile.full_name || ''} />
        ) : null}
        <AvatarFallback className="text-[6px]">{userInitials}</AvatarFallback>
      </Avatar>
      <span className="truncate">{event.title}</span>
    </div>
  );
}
