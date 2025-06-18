import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, isSameMonth, isToday, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { EnhancedCalendarEventCard } from './EnhancedCalendarEventCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileMonthView } from './MobileMonthView';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { Calendar, Clock, Edit, Trash2, Copy } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDayClick?: (date: Date) => void;
  onQuickEventCreate?: (date: Date, template?: string) => void;
  onEventEdit?: (event: CalendarEvent) => void;
  onEventDelete?: (event: CalendarEvent) => void;
  onEventDuplicate?: (event: CalendarEvent) => void;
}

const EVENT_TEMPLATES = [
  { id: 'school-pickup', label: 'School Pickup', icon: '🚗', duration: 1 },
  { id: 'doctor-appointment', label: 'Doctor Appointment', icon: '🏥', duration: 2 },
  { id: 'meeting', label: 'Meeting', icon: '💼', duration: 1 },
  { id: 'dentist', label: 'Dentist', icon: '🦷', duration: 1.5 },
  { id: 'grocery-shopping', label: 'Grocery Shopping', icon: '🛒', duration: 1 },
];

export function MonthView({ 
  currentDate, 
  events, 
  onEventClick, 
  onDayClick,
  onQuickEventCreate,
  onEventEdit,
  onEventDelete,
  onEventDuplicate
}: MonthViewProps) {
  const isMobile = useIsMobile();
  
  // Use mobile view for mobile devices
  if (isMobile) {
    return (
      <MobileMonthView
        currentDate={currentDate}
        events={events}
        onEventClick={onEventClick}
        onDayClick={onDayClick}
      />
    );
  }
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      return isSameDay(day, eventStart) || 
             isSameDay(day, eventEnd) || 
             (day >= eventStart && day <= eventEnd);
    }).map(event => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      const duration = differenceInDays(eventEnd, eventStart) + 1;
      
      return {
        ...event,
        isMultiDay: duration > 1,
        duration,
        isFirstDay: isSameDay(day, eventStart),
        isLastDay: isSameDay(day, eventEnd)
      };
    });
  };

  const handleDayClick = (day: Date, e: React.MouseEvent) => {
    console.log('MonthView day clicked:', day);
    console.log('Event target:', e.target);
    console.log('Current target:', e.currentTarget);
    
    // Check if the click was on an event element
    const target = e.target as HTMLElement;
    const isEventClick = target.closest('[data-event-id]') || 
                        target.classList.contains('event-card') ||
                        target.closest('.event-card');
    
    console.log('Is event click?', isEventClick);
    
    if (!isEventClick) {
      console.log('Calling onDayClick for empty day space');
      onDayClick?.(day);
    }
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    console.log('MonthView event clicked:', event.title);
    e.stopPropagation();
    e.preventDefault();
    onEventClick(event);
  };

  const handleQuickCreate = (date: Date, template?: string) => {
    console.log('Quick create for:', date, template);
    onQuickEventCreate?.(date, template);
  };

  const handleEventAction = (action: string, event: CalendarEvent) => {
    switch (action) {
      case 'edit':
        onEventEdit?.(event);
        break;
      case 'delete':
        onEventDelete?.(event);
        break;
      case 'duplicate':
        onEventDuplicate?.(event);
        break;
    }
  };

  return (
    <div className="month-view">
      {/* Header with day names */}
      <div className="grid grid-cols-7 gap-px mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-medium py-2 text-sm text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          
          return (
            <ContextMenu key={day.toString()}>
              <ContextMenuTrigger>
                <div
                  className={cn(
                    "min-h-[120px] bg-background p-2 cursor-pointer hover:bg-accent/50 transition-colors",
                    !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                    isCurrentDay && "bg-primary/10 ring-1 ring-primary/20"
                  )}
                  onClick={(e) => handleDayClick(day, e)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-sm font-medium",
                      isCurrentDay && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    )}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <Badge variant="secondary" className="text-xs h-5">
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1 max-h-[80px] overflow-hidden">
                    {dayEvents.slice(0, 3).map((event) => (
                      <ContextMenu key={`${event.id}-${day.toString()}`}>
                        <ContextMenuTrigger>
                          <EnhancedCalendarEventCard
                            event={event}
                            onClick={handleEventClick}
                            compact={true}
                            showMultiDayBadge={false}
                          />
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => handleEventAction('edit', event)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Event
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleEventAction('duplicate', event)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate Event
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem 
                            onClick={() => handleEventAction('delete', event)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Event
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                    
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => handleQuickCreate(day)}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Event
                </ContextMenuItem>
                <ContextMenuSeparator />
                {EVENT_TEMPLATES.map((template) => (
                  <ContextMenuItem 
                    key={template.id}
                    onClick={() => handleQuickCreate(day, template.id)}
                  >
                    <span className="mr-2">{template.icon}</span>
                    {template.label}
                  </ContextMenuItem>
                ))}
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>
    </div>
  );
}
