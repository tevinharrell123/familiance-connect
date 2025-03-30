
import { CalendarEvent } from '@/types/calendar';
import { 
  isSameDay, 
  parseISO, 
  isWithinInterval, 
  areIntervalsOverlapping,
  differenceInDays,
  startOfDay,
  endOfDay
} from 'date-fns';

/**
 * Get events for a specific day
 */
export const getEventsForDay = (day: Date, events: CalendarEvent[]): CalendarEvent[] => {
  if (!events || events.length === 0) return [];
  
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  
  return events.filter(event => {
    const eventStart = parseISO(event.start_date);
    const eventEnd = parseISO(event.end_date);
    
    // Check if the day falls within the event's date range
    return isWithinInterval(dayStart, { start: startOfDay(eventStart), end: endOfDay(eventEnd) });
  });
};

/**
 * Enhance event with duration information
 */
export const addEventDurationInfo = (event: CalendarEvent): CalendarEvent & { isMultiDay: boolean; duration: number } => {
  const eventStart = parseISO(event.start_date);
  const eventEnd = parseISO(event.end_date);
  const duration = differenceInDays(endOfDay(eventEnd), startOfDay(eventStart));
  
  return {
    ...event,
    isMultiDay: duration > 0,
    duration: duration + 1 // Include both start and end days
  };
};

/**
 * Group events by week for multi-day rendering
 */
export const getWeeklyEvents = (days: Date[], events: CalendarEvent[], isMobile = false) => {
  if (!events || events.length === 0) return [];
  
  // Filter for multi-day events only
  const multiDayEvents = events.filter(event => {
    const eventStart = parseISO(event.start_date);
    const eventEnd = parseISO(event.end_date);
    return differenceInDays(endOfDay(eventEnd), startOfDay(eventStart)) > 0;
  });
  
  if (multiDayEvents.length === 0) return [];
  
  // Split days into weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  
  // Calculate max rows to show based on mobile/desktop
  const maxRows = isMobile ? 2 : 5; // Limit to fewer rows on mobile
  
  // Process each week
  const processedEvents = weeks.flatMap((week, weekIdx) => {
    const weekStart = startOfDay(week[0]);
    const weekEnd = endOfDay(week[6]);
    
    // Find events that overlap with this week
    const overlappingEvents = multiDayEvents.filter(event => {
      const eventStart = startOfDay(parseISO(event.start_date));
      const eventEnd = endOfDay(parseISO(event.end_date));
      
      return areIntervalsOverlapping(
        { start: weekStart, end: weekEnd },
        { start: eventStart, end: eventEnd }
      );
    });
    
    // Sort events by duration (longest first) for better layout
    overlappingEvents.sort((a, b) => {
      const aStart = startOfDay(parseISO(a.start_date));
      const aEnd = endOfDay(parseISO(a.end_date));
      const bStart = startOfDay(parseISO(b.start_date));
      const bEnd = endOfDay(parseISO(b.end_date));
      
      const aDuration = differenceInDays(aEnd, aStart);
      const bDuration = differenceInDays(bEnd, bStart);
      
      // Sort by duration first (longer events first)
      return bDuration - aDuration;
    });
    
    // Group events by rows to prevent overlapping
    const rows: Array<Array<{ 
      event: CalendarEvent; 
      startIdx: number; 
      endIdx: number;
      weekIdx: number;
    }>> = [];
    
    // Process each event for this week
    overlappingEvents.forEach(event => {
      const eventStart = startOfDay(parseISO(event.start_date));
      const eventEnd = endOfDay(parseISO(event.end_date));
      
      // Find where in this week the event starts and ends
      let startIdx = week.findIndex(day => 
        isSameDay(day, eventStart) || startOfDay(day) > eventStart
      );
      
      if (startIdx === -1 && eventStart < weekStart) {
        startIdx = 0; // Event starts before this week
      }
      
      let endIdx = week.findIndex(day => 
        isSameDay(day, eventEnd) || startOfDay(day) > eventEnd
      );
      
      // If event ends after this week or on the last day
      if (endIdx === -1 || eventEnd > weekEnd) {
        endIdx = 6; // Event ends after this week
      } else if (endIdx > 0) {
        // If we found the day after the end, correct it
        endIdx = endIdx - 1;
      }
      
      // Ensure startIdx is valid
      if (startIdx === -1 || startIdx > 6) {
        // Event doesn't start in this week
        return;
      }
      
      // Ensure endIdx is valid and not before startIdx
      endIdx = Math.max(startIdx, Math.min(endIdx, 6));
      
      // Find a row where this event can be placed without overlapping
      let rowPosition = 0;
      let placed = false;
      
      while (!placed && rowPosition < maxRows) { // Limit rows based on mobile/desktop
        if (!rows[rowPosition]) {
          rows[rowPosition] = [];
        }
        
        // Check if this event overlaps with any event in this row
        const overlaps = rows[rowPosition].some(existingEvent => {
          return (startIdx <= existingEvent.endIdx && endIdx >= existingEvent.startIdx);
        });
        
        if (!overlaps) {
          // Place event in this row
          rows[rowPosition].push({
            event,
            startIdx,
            endIdx,
            weekIdx
          });
          placed = true;
        } else {
          // Try next row
          rowPosition++;
        }
      }
      
      // If we couldn't place it in any row, skip this event
      // This ensures we don't show too many events on small screens
    });
    
    // Flatten rows into events with row position
    return rows.flatMap((row, rowIdx) => 
      row.map(eventData => ({
        ...eventData,
        rowPosition: rowIdx
      }))
    );
  });
  
  return processedEvents;
};
