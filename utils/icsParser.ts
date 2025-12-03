import { CalendarEvent } from '../types';

/**
 * A simplified ICS parser for VEVENTs.
 * Handles standard date formats and basic fields.
 */
export const parseICS = (icsContent: string): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const lines = icsContent.split(/\r\n|\n|\r/);
  
  let currentEvent: Partial<CalendarEvent> | null = null;
  let inEvent = false;

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    
    // Remove "VALUE=DATE:" or similar prefixes if present in the value part (though usually handled by split)
    const cleanStr = dateStr.replace(/.*:/, '');

    // YYYYMMDD
    if (/^\d{8}$/.test(cleanStr)) {
      const y = parseInt(cleanStr.substring(0, 4));
      const m = parseInt(cleanStr.substring(4, 6)) - 1;
      const d = parseInt(cleanStr.substring(6, 8));
      return new Date(y, m, d);
    }
    
    // YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMSS
    if (/^\d{8}T\d{6}Z?$/.test(cleanStr)) {
      const y = parseInt(cleanStr.substring(0, 4));
      const m = parseInt(cleanStr.substring(4, 6)) - 1;
      const d = parseInt(cleanStr.substring(6, 8));
      const h = parseInt(cleanStr.substring(9, 11));
      const min = parseInt(cleanStr.substring(11, 13));
      const s = parseInt(cleanStr.substring(13, 15));
      
      // Treat as local for simplicity in this visual calendar app
      return new Date(y, m, d, h, min, s);
    }

    return null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
      continue;
    }

    if (line === 'END:VEVENT') {
      if (inEvent && currentEvent && currentEvent.title && currentEvent.startDate) {
        events.push({
          id: Math.random().toString(36).substring(7),
          title: currentEvent.title,
          description: currentEvent.description || '',
          startDate: currentEvent.startDate,
          endDate: currentEvent.endDate,
          allDay: !currentEvent.endDate || (currentEvent.endDate.getTime() - currentEvent.startDate.getTime()) % 86400000 === 0 // Heuristic
        } as CalendarEvent);
      }
      inEvent = false;
      currentEvent = null;
      continue;
    }

    if (inEvent && currentEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.title = line.substring(8);
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.description = line.substring(12);
      } else if (line.startsWith('DTSTART')) {
        // Handle DTSTART;VALUE=DATE:2023... or DTSTART:2023...
        const parts = line.split(':');
        if (parts.length >= 2) {
          const dateVal = parts[1];
          const date = parseDate(dateVal);
          if (date) currentEvent.startDate = date;
        }
      } else if (line.startsWith('DTEND')) {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const dateVal = parts[1];
          const date = parseDate(dateVal);
          if (date) currentEvent.endDate = date;
        }
      }
    }
  }

  return events;
};
