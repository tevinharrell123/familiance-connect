
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, User, FileText, Edit } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface EventDetailsDialogProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditClick: (event: CalendarEvent) => void;
}

export function EventDetailsDialog({
  event,
  open,
  onOpenChange,
  onEditClick,
}: EventDetailsDialogProps) {
  if (!event) return null;
  
  const startDate = parseISO(event.start_date);
  const endDate = parseISO(event.end_date);
  const isSameDay = startDate.toDateString() === endDate.toDateString();
  const isMultiDay = differenceInDays(endDate, startDate) > 0;
  const duration = differenceInDays(endDate, startDate) + 1;
  
  const userInitials = event.user_profile?.full_name
    ? event.user_profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: event.color || '#7B68EE' }}
            />
            {event.title}
          </DialogTitle>
          {isSameDay ? (
            <DialogDescription>
              {format(startDate, 'EEEE, MMMM d, yyyy')}
            </DialogDescription>
          ) : (
            <DialogDescription>
              {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              {event.user_profile?.avatar_url ? (
                <AvatarImage src={event.user_profile.avatar_url} alt={event.user_profile.full_name || ''} />
              ) : null}
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-medium">
                {event.user_profile?.full_name || 'Unknown user'}
              </h3>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {isMultiDay ? (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {duration} days
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(startDate, 'p')}
                  </Badge>
                )}
                
                <Badge variant="outline" className="flex items-center gap-1">
                  {event.is_household_event ? (
                    <>
                      <Users className="h-3 w-3" />
                      Household
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3" />
                      Personal
                    </>
                  )}
                </Badge>
              </div>
              
              {event.description && (
                <div className="mt-4">
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <FileText className="h-4 w-4 mr-1" />
                    Description
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{event.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={() => {
              onOpenChange(false);
              onEditClick(event);
            }}
          >
            <Edit className="h-4 w-4" />
            Edit Event
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
