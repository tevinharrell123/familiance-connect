
import { CalendarEvent } from '@/types/calendar';
import { 
  isSameDay, 
  parseISO, 
  isWithinInterval, 
  areIntervalsOverlapping,
  differenceInDays
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
 * Enhance event with duration information
 */
export const addEventDurationInfo = (event: CalendarEvent): CalendarEvent & { isMultiDay: boolean; duration: number } => {
  const eventStart = parseISO(event.start_date);
  const eventEnd = parseISO(event.end_date);
  const duration = differenceInDays(eventEnd, eventStart);
  
  return {
    ...event,
    isMultiDay: duration > 0,
    duration: duration + 1 // Include both start and end days
  };
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
      
      // Only consider multi-day events
      if (differenceInDays(eventEnd, eventStart) === 0) return false;
      
      return areIntervalsOverlapping(
        { start: weekStart, end: weekEnd },
        { start: eventStart, end: eventEnd }
      );
    });
    
    // Calculate position and span for each event
    return weekEvents.map(event => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      
      // Find start day index within this week
      let startIdx = week.findIndex(day => 
        isSameDay(day, eventStart) || (day > eventStart && day <= eventEnd)
      );
      
      // If event starts before this week
      if (startIdx === -1 && eventStart < weekStart) {
        startIdx = 0;
      }
      
      // Find end day index within this week
      let endIdx = week.findIndex((day, idx) => 
        (idx >= startIdx && isSameDay(day, eventEnd)) || (idx >= startIdx && day > eventEnd)
      );
      
      // If event ends after this week
      if (endIdx === -1 && eventEnd > weekEnd) {
        endIdx = 6;
      } else if (endIdx === -1 && startIdx !== -1) {
        // If end wasn't found but start was, set to end of week
        endIdx = 6;
      } else if (endIdx > 0) {
        // If end was found, adjust to the day before (since the found day is after the end)
        endIdx = endIdx - 1;
      }
      
      // Only return valid events (events that appear in this week)
      if (startIdx !== -1) {
        return {
          event,
          startIdx: startIdx,
          endIdx: endIdx === -1 ? 6 : endIdx,
          weekIdx: weeks.indexOf(week)
        };
      }
      return null;
    }).filter(Boolean); // Remove null entries
  }).flat();
};
