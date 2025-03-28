
import { CalendarEvent } from '@/types/calendar';
import { 
  isSameDay, 
  parseISO, 
  isWithinInterval, 
  areIntervalsOverlapping 
} from 'date-fns';

/**
 * Get events for a specific day
 */
export const getEventsForDay = (day: Date, events: CalendarEvent[]): CalendarEvent[] => {
  if (!events || events.length === 0) return [];
  
  return events.filter(event => {
    const eventStart = parseISO(event.start_date);
    const eventEnd = parseISO(event.end_date);
    
    // Check if the day falls within the event's date range
    return (day >= eventStart && day <= eventEnd) || 
           isSameDay(day, eventStart) || 
           isSameDay(day, eventEnd);
  });
};

/**
 * Group events by week for multi-day rendering
 */
export const getWeeklyEvents = (days: Date[], events: CalendarEvent[]) => {
  if (!events || events.length === 0) return [];
  
  // Split days into weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  
  // For each week, find events that span across days
  return weeks.map(week => {
    const weekStart = week[0];
    const weekEnd = week[6];
    
    // Get events that overlap with this week
    const weekEvents = events.filter(event => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      
      return areIntervalsOverlapping(
        { start: weekStart, end: weekEnd },
        { start: eventStart, end: eventEnd }
      );
    });
    
    // Calculate position and span for each event
    return weekEvents.map(event => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      
      // Find start and end day indices within this week
      const startIdx = week.findIndex(day => 
        isWithinInterval(day, { start: eventStart, end: eventEnd }) || isSameDay(day, eventStart)
      );
      
      const endIdx = week.findIndex((day, idx) => 
        (idx >= startIdx && (isSameDay(day, eventEnd) || day > eventEnd))
      );
      
      return {
        event,
        startIdx: startIdx === -1 ? 0 : startIdx,
        endIdx: endIdx === -1 ? 6 : endIdx,
        weekIdx: weeks.indexOf(week)
      };
    });
  }).flat();
};
