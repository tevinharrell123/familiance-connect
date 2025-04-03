
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarEvent } from '@/types/calendar';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { User, Users, Calendar, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface EventDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent | null;
  onEditClick?: (event: CalendarEvent) => void;
  onDeleteClick?: () => void;
}

export function EventDetailsDialog({
  open,
  onOpenChange,
  event,
  onEditClick,
  onDeleteClick,
}: EventDetailsDialogProps) {
  const { user } = useAuth();
  
  if (!event) return null;
  
  const eventStart = parseISO(event.start_date);
  const eventEnd = parseISO(event.end_date);
  const isMultiDay = differenceInCalendarDays(eventEnd, eventStart) > 0;
  const duration = differenceInCalendarDays(eventEnd, eventStart) + 1;
  
  const isCurrentUserEvent = event.user_id === user?.id;
  
  // Get user initials for avatar - handle cases where full_name might be null or undefined
  const fullName = event.user_profile?.full_name || '';
  const userInitials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : '?';
  
  const handleEditClick = () => {
    if (onEditClick && event) {
      onEditClick(event);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: event.color || '#7B68EE' }}
            ></div>
            {event.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 mt-2">
            {event.is_household_event ? (
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Household
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Personal
              </Badge>
            )}
            
            {isMultiDay && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {duration} days
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {event.description && (
            <div className="text-sm">
              {event.description}
            </div>
          )}
          
          <div className="grid grid-cols-[20px_1fr] gap-x-2 gap-y-1 items-center text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="font-medium">
              {format(eventStart, 'MMMM d, yyyy')}
              {isMultiDay && ` – ${format(eventEnd, 'MMMM d, yyyy')}`}
            </div>
            
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              {format(eventStart, 'h:mm a')}
              {' – '}
              {format(eventEnd, 'h:mm a')}
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <Avatar className="h-8 w-8">
              {event.user_profile?.avatar_url ? (
                <AvatarImage 
                  src={event.user_profile.avatar_url} 
                  alt={event.user_profile.full_name || 'User'} 
                />
              ) : null}
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium">
                {event.user_profile?.full_name || 'Unknown User'}
              </div>
              <div className="text-xs text-muted-foreground">
                {isCurrentUserEvent ? 'Created by you' : 'Event owner'}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {isCurrentUserEvent && (
            <div className="flex gap-2">
              {onDeleteClick && (
                <Button variant="destructive" onClick={onDeleteClick}>
                  Delete
                </Button>
              )}
              <Button onClick={handleEditClick}>
                Edit Event
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
