
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { 
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, User, Calendar } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface CalendarEventCardProps {
  event: CalendarEvent & { isMultiDay?: boolean; duration?: number };
  onClick?: () => void;
  showMultiDayBadge?: boolean;
}

export function CalendarEventCard({ event, onClick, showMultiDayBadge = false }: CalendarEventCardProps) {
  const { 
    title, 
    color, 
    start_date, 
    end_date, 
    is_household_event,
    user_profile,
    isMultiDay,
    duration
  } = event;
  
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  const formattedDate = format(startDate, 'MMM d, yyyy');
  const isSameDay = startDate.toDateString() === endDate.toDateString();
  
  // Calculate multi-day status if not provided
  const isMultiDayEvent = isMultiDay !== undefined ? 
    isMultiDay : 
    differenceInDays(parseISO(end_date), parseISO(start_date)) > 0;
  
  const eventDuration = duration || 
    (isMultiDayEvent ? differenceInDays(parseISO(end_date), parseISO(start_date)) + 1 : 1);
  
  const userInitials = user_profile?.full_name
    ? user_profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?';
    
  const cardStyle = {
    borderLeft: `4px solid ${color || '#7B68EE'}`,
    backgroundColor: `${color || '#7B68EE'}10`
  };
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      style={cardStyle}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-sm line-clamp-1">{title}</h4>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
            {showMultiDayBadge && isMultiDayEvent && (
              <Badge variant="outline" className="mt-1 text-[10px] h-5 bg-primary/10">
                <Calendar className="h-3 w-3 mr-1" />
                {eventDuration} day{eventDuration > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            {is_household_event ? (
              <Users className="h-3 w-3 mr-1" />
            ) : (
              <User className="h-3 w-3 mr-1" />
            )}
            <span>{is_household_event ? 'Household' : 'Personal'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-3 py-2 border-t flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          {isSameDay ? 'All day' : format(startDate, 'p')}
        </div>
        <Avatar className="h-5 w-5">
          {user_profile?.avatar_url ? (
            <AvatarImage src={user_profile.avatar_url} alt={user_profile.full_name || ''} />
          ) : null}
          <AvatarFallback className="text-[10px]">{userInitials}</AvatarFallback>
        </Avatar>
      </CardFooter>
    </Card>
  );
}
