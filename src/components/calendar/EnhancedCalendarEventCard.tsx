
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { 
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, User, Calendar, Repeat } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useChildProfiles } from '@/hooks/household/useChildProfiles';
import { useFamilyMembers } from '@/hooks/household/useFamilyMembers';

interface EnhancedCalendarEventCardProps {
  event: CalendarEvent & { isMultiDay?: boolean; duration?: number };
  onClick?: (event: CalendarEvent) => void;
  showMultiDayBadge?: boolean;
  compact?: boolean;
}

export function EnhancedCalendarEventCard({ 
  event, 
  onClick, 
  showMultiDayBadge = false, 
  compact = false 
}: EnhancedCalendarEventCardProps) {
  const { childProfiles } = useChildProfiles();
  const { members: householdMembers } = useFamilyMembers();
  
  const { 
    title, 
    color, 
    start_date, 
    end_date, 
    is_household_event,
    user_profile,
    isMultiDay,
    duration,
    assigned_to_child,
    assigned_to_member,
    recurrence_type,
    category
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
  
  // Get assigned person info
  const assignedPerson = React.useMemo(() => {
    if (assigned_to_child) {
      const child = childProfiles?.find(c => c.id === assigned_to_child);
      if (child) {
        return {
          name: child.name,
          avatar_url: child.avatar_url,
          type: 'child' as const
        };
      }
    }
    
    if (assigned_to_member) {
      const member = householdMembers?.find(m => m.user_id === assigned_to_member);
      if (member) {
        return {
          name: member.user_profiles?.full_name || 'Unknown Member',
          avatar_url: member.user_profiles?.avatar_url,
          type: 'member' as const
        };
      }
    }
    
    // Fallback to event creator
    if (user_profile) {
      return {
        name: user_profile.full_name || 'Unknown User',
        avatar_url: user_profile.avatar_url,
        type: 'creator' as const
      };
    }
    
    return null;
  }, [assigned_to_child, assigned_to_member, childProfiles, householdMembers, user_profile]);
  
  const getPersonInitials = (name: string) => {
    return name
      ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : '?';
  };
    
  const cardStyle = {
    borderLeft: `4px solid ${color || '#7B68EE'}`,
    backgroundColor: `${color || '#7B68EE'}10`
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      console.log('Enhanced calendar event card clicked:', event.id);
      onClick(event);
    }
  };
  
  if (compact) {
    return (
      <div
        className="text-xs p-1 cursor-pointer hover:opacity-80 transition-opacity rounded border-l-2"
        style={{ 
          backgroundColor: `${color || '#7B68EE'}20`,
          borderColor: color || '#7B68EE'
        }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-1 truncate">
          {assignedPerson && (
            <Avatar className="h-3 w-3 flex-shrink-0">
              {assignedPerson.avatar_url ? (
                <AvatarImage src={assignedPerson.avatar_url} />
              ) : null}
              <AvatarFallback className="text-[8px]">
                {getPersonInitials(assignedPerson.name)}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="truncate font-medium">{title}</span>
          {recurrence_type && recurrence_type !== 'none' && (
            <Repeat className="h-2 w-2 opacity-70" />
          )}
        </div>
      </div>
    );
  }
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      style={cardStyle}
      onClick={handleClick}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-sm line-clamp-1">{title}</h4>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
            {category && (
              <Badge variant="outline" className="mt-1 text-[10px] h-5">
                {category}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {recurrence_type && recurrence_type !== 'none' && (
              <Repeat className="h-3 w-3 text-muted-foreground" />
            )}
            {is_household_event ? (
              <Users className="h-3 w-3 text-muted-foreground" />
            ) : (
              <User className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        </div>
        
        {showMultiDayBadge && isMultiDayEvent && (
          <Badge variant="outline" className="mb-2 text-[10px] h-5 bg-primary/10">
            <Calendar className="h-3 w-3 mr-1" />
            {eventDuration} day{eventDuration > 1 ? 's' : ''}
          </Badge>
        )}
      </CardContent>
      
      <CardFooter className="px-3 py-2 border-t flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          {isSameDay ? 'All day' : format(startDate, 'p')}
        </div>
        
        {assignedPerson && (
          <div className="flex items-center gap-1">
            <Avatar className="h-5 w-5">
              {assignedPerson.avatar_url ? (
                <AvatarImage src={assignedPerson.avatar_url} alt={assignedPerson.name} />
              ) : null}
              <AvatarFallback className="text-[10px]">
                {getPersonInitials(assignedPerson.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate max-w-20">
              {assignedPerson.name}
            </span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
