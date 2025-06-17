
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { User, Users, Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface MobileEventSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent | null;
  onEditClick?: (event: CalendarEvent) => void;
  onDeleteClick?: () => void;
}

export function MobileEventSheet({
  open,
  onOpenChange,
  event,
  onEditClick,
  onDeleteClick,
}: MobileEventSheetProps) {
  const { user } = useAuth();
  
  if (!event) return null;
  
  const eventStart = parseISO(event.start_date);
  const eventEnd = parseISO(event.end_date);
  const isMultiDay = differenceInCalendarDays(eventEnd, eventStart) > 0;
  const duration = differenceInCalendarDays(eventEnd, eventStart) + 1;
  
  const isCurrentUserEvent = event.user_id === user?.id;
  
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0" 
              style={{ backgroundColor: event.color || '#7B68EE' }}
            />
            <DrawerTitle className="text-lg font-semibold">{event.title}</DrawerTitle>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
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
          </div>
        </DrawerHeader>
        
        <div className="px-4 space-y-4">
          {event.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
          )}
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium">
                  {format(eventStart, 'MMMM d, yyyy')}
                  {isMultiDay && ` – ${format(eventEnd, 'MMMM d, yyyy')}`}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="text-sm">
                {format(eventStart, 'h:mm a')} – {format(eventEnd, 'h:mm a')}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pt-2 border-t">
            <Avatar className="h-10 w-10">
              {event.user_profile?.avatar_url ? (
                <AvatarImage 
                  src={event.user_profile.avatar_url} 
                  alt={event.user_profile.full_name || 'User'} 
                />
              ) : null}
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">
                {event.user_profile?.full_name || 'Unknown User'}
              </div>
              <div className="text-xs text-muted-foreground">
                {isCurrentUserEvent ? 'Created by you' : 'Event owner'}
              </div>
            </div>
          </div>
        </div>
        
        <DrawerFooter className="pt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            {isCurrentUserEvent && (
              <>
                {onDeleteClick && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={onDeleteClick}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  className="flex-1"
                  onClick={handleEditClick}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </Button>
              </>
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
