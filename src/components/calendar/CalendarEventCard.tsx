
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { 
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, User, Calendar, House } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface CalendarEventCardProps {
  event: CalendarEvent & { isMultiDay?: boolean; duration?: number };
  onClick?: (event: CalendarEvent) => void;
  showMultiDayBadge?: boolean;
}

export function CalendarEventCard({ event, onClick, showMultiDayBadge = false }: CalendarEventCardProps) {
  const { 
    title, 
    color, 
    start_date, 
    end_date, 
    is_household_event,
    assigned_child_profile,
    assigned_member_profile,
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
  
  // Determine assigned person info - prioritize assigned child, then member, then creator
  const assignedPerson = assigned_child_profile 
    ? { name: assigned_child_profile.name, avatar_url: assigned_child_profile.avatar_url, type: 'child' }
    : assigned_member_profile 
    ? { name: assigned_member_profile.full_name || 'Unknown Member', avatar_url: assigned_member_profile.avatar_url, type: 'member' }
    : user_profile
    ? { name: user_profile.full_name || 'Unknown User', avatar_url: user_profile.avatar_url, type: 'creator' }
    : null;
    
  const userInitials = assignedPerson?.name
    ? assignedPerson.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?';
    
  const cardStyle = {
    borderLeft: `4px solid ${color || '#7B68EE'}`,
    backgroundColor: `${color || '#7B68EE'}10`
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      console.log('Calendar event card clicked:', event.id);
      onClick(event);
    }
  };
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      style={cardStyle}
      onClick={handleClick}
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
        {assignedPerson ? (
          <div className="flex items-center gap-1" title={`Assigned to: ${assignedPerson.name}`}>
            <Avatar className="h-5 w-5">
              {assignedPerson.avatar_url ? (
                <AvatarImage src={assignedPerson.avatar_url} alt={assignedPerson.name} />
              ) : null}
              <AvatarFallback className="text-[10px]">{userInitials}</AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <div className="flex items-center" title="Household event">
            <House className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
