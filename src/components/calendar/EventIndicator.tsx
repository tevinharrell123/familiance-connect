
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface EventIndicatorProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
}

export function EventIndicator({ event, onClick }: EventIndicatorProps) {
  const userInitials = event.user_profile?.full_name
    ? event.user_profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?';
      
  return (
    <div 
      key={event.id} 
      className="flex items-center text-xs rounded-full px-1 mt-1 truncate cursor-pointer hover:opacity-80"
      style={{ backgroundColor: `${event.color || '#7B68EE'}30` }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
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
