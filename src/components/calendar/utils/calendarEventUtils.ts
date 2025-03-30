
import { CalendarEvent } from '@/types/calendar';
import { 
  isSameDay, 
  parseISO, 
  isWithinInterval, 
  areIntervalsOverlapping,
  differenceInDays,
  isBefore,
  isAfter,
  startOfDay
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
  
  // Convert all dates to start of day to avoid time issues
  const normalizedDays = days.map(day => startOfDay(day));
  
  // Split days into weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < normalizedDays.length; i += 7) {
    weeks.push(normalizedDays.slice(i, i + 7));
  }
  
  // Log first and last day to debug
  console.log("Calendar range:", normalizedDays[0], "to", normalizedDays[normalizedDays.length - 1]);
  
  // For each week, find events that span across days
  return weeks.flatMap((week, weekIndex) => {
    const weekStart = week[0];
    const weekEnd = week[6];
    
    // Log week range for debugging
    console.log(`Week ${weekIndex} range:`, weekStart, "to", weekEnd);
    
    // Get events that overlap with this week
    const weekEvents = events.filter(event => {
      const eventStart = startOfDay(parseISO(event.start_date));
      const eventEnd = startOfDay(parseISO(event.end_date));
      
      // Only consider multi-day events
      if (differenceInDays(eventEnd, eventStart) === 0) return false;
      
      // Check if the event overlaps with this week
      const overlap = areIntervalsOverlapping(
        { start: weekStart, end: weekEnd },
        { start: eventStart, end: eventEnd }
      );
      
      // Debug logging for event overlap
      if (overlap) {
        console.log(`Event ${event.title} (${eventStart} to ${eventEnd}) overlaps with week ${weekIndex}`);
      }
      
      return overlap;
    });
    
    // Calculate position and span for each event within the week
    return weekEvents.map(event => {
      const eventStart = startOfDay(parseISO(event.start_date));
      const eventEnd = startOfDay(parseISO(event.end_date));
      
      // Debug the exact event dates
      console.log(`Positioning event ${event.title}: ${eventStart} to ${eventEnd}`);
      
      // Find the start day's index within this week (0-6)
      let startIdx = week.findIndex(day => 
        isSameDay(day, eventStart) || (isAfter(day, eventStart) && isBefore(day, eventEnd) || isSameDay(day, eventEnd))
      );
      
      // If event starts before this week
      if (startIdx === -1 && isBefore(eventStart, weekStart)) {
        startIdx = 0;
        console.log(`Event ${event.title} starts before this week, using startIdx = 0`);
      } else if (startIdx === -1) {
        console.log(`Event ${event.title} had no valid startIdx in this week`);
        return null; // Skip this event for this week
      }
      
      // Find the end day's index within this week (0-6)
      // First look for exact match with end date
      let endIdx = week.findIndex(day => isSameDay(day, eventEnd));
      
      // If no exact match, find the last day that's within the event range
      if (endIdx === -1) {
        // Find all days in the week that are before or equal to the event end
        const daysBeforeEnd = week.map((day, idx) => 
          (isBefore(day, eventEnd) || isSameDay(day, eventEnd)) ? idx : -1
        ).filter(idx => idx !== -1);
        
        // Use the last day as the endIdx
        endIdx = daysBeforeEnd.length > 0 ? Math.max(...daysBeforeEnd) : -1;
      }
      
      // If event ends after this week
      if (endIdx === -1 && isAfter(eventEnd, weekEnd)) {
        endIdx = 6;
        console.log(`Event ${event.title} ends after this week, using endIdx = 6`);
      } else if (endIdx === -1) {
        console.log(`Event ${event.title} had no valid endIdx in this week`);
        return null; // Skip this event for this week
      }
      
      console.log(`Event ${event.title} positioned at week ${weekIndex}, startIdx=${startIdx}, endIdx=${endIdx}`);
      
      // Only return valid events (events that appear in this week)
      if (startIdx !== -1 && endIdx !== -1) {
        return {
          event,
          startIdx,
          endIdx,
          weekIdx: weekIndex
        };
      }
      return null;
    }).filter(Boolean); // Remove null entries
  });
};
