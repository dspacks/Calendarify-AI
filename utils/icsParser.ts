/**
 * ICS Parser Utility
 *
 * Parses ICS (iCalendar) format files into JavaScript objects.
 * Implements a subset of RFC 5545 specification, focusing on
 * VEVENT components commonly found in calendar exports from
 * Google Calendar, Outlook, and Apple Calendar.
 *
 * @module icsParser
 * @see https://datatracker.ietf.org/doc/html/rfc5545
 */

import { CalendarEvent } from '../types';

/**
 * Parses ICS calendar file content into an array of calendar events.
 *
 * This parser handles the most common ICS features needed for calendar display:
 * - VEVENT components (calendar events)
 * - Basic fields: SUMMARY, DESCRIPTION, DTSTART, DTEND
 * - Multiple date formats (all-day and timed events)
 * - Multiple line breaks (CRLF, LF, CR)
 *
 * @param icsContent - Raw ICS file content as a string
 * @returns Array of parsed calendar events
 *
 * @example
 * ```typescript
 * const fileContent = await file.text();
 * const events = parseICS(fileContent);
 *
 * events.forEach(event => {
 *   console.log(`${event.title} on ${event.startDate}`);
 * });
 * ```
 *
 * @remarks
 * **Supported Features:**
 * - SUMMARY → event title
 * - DESCRIPTION → event description
 * - DTSTART → start date/time
 * - DTEND → end date/time
 * - Date formats: YYYYMMDD, YYYYMMDDTHHMMSSZ
 *
 * **Limitations:**
 * - Does NOT support recurring events (RRULE)
 * - Timezone data (VTIMEZONE) is ignored, all dates treated as local
 * - VALARM (reminders) not parsed
 * - Only VEVENT components processed (VTODO, VJOURNAL ignored)
 * - Complex multi-line values may not be handled correctly
 *
 * **All-Day Detection:**
 * Events are marked as all-day if they have no end date, or if the
 * duration is an exact multiple of 24 hours (heuristic approach).
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
