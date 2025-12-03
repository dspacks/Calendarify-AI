/**
 * Type Definitions for Calendarify AI
 *
 * This module contains all TypeScript interfaces and types used
 * throughout the application for type safety and documentation.
 *
 * @module types
 */

/**
 * Represents a single calendar event.
 *
 * This is the core data structure for calendar events, parsed from
 * ICS files and displayed in the calendar grid.
 *
 * @interface CalendarEvent
 */
export interface CalendarEvent {
  /** Unique identifier for the event (generated if not in ICS) */
  id: string;

  /** Event title/summary (from ICS SUMMARY field) */
  title: string;

  /** Optional event description (from ICS DESCRIPTION field) */
  description?: string;

  /** Event start date/time (from ICS DTSTART) */
  startDate: Date;

  /** Optional event end date/time (from ICS DTEND) */
  endDate?: Date;

  /** Whether this is an all-day event (heuristically determined) */
  allDay: boolean;
}

/**
 * Represents a calendar day with its events and generated AI art.
 *
 * This structure is used to track the state of each day in the
 * calendar grid, including events, generated images, and loading states.
 *
 * @interface DayData
 */
export interface DayData {
  /** The calendar date for this day */
  date: Date;

  /** All events occurring on this day */
  events: CalendarEvent[];

  /**
   * Base64 encoded image data from AI generation.
   * Format: "data:image/png;base64,..."
   */
  imageData?: string;

  /** Whether AI art generation is currently in progress for this day */
  isGenerating?: boolean;
}

/**
 * Application loading states.
 *
 * Used to track the current state of async operations like file parsing
 * and AI image generation.
 *
 * @enum LoadingState
 */
export enum LoadingState {
  /** No operation in progress */
  IDLE = 'IDLE',

  /** Currently parsing uploaded ICS file(s) */
  PARSING = 'PARSING',

  /** Currently generating AI images for events */
  GENERATING_IMAGES = 'GENERATING_IMAGES',

  /** An error occurred during an operation */
  ERROR = 'ERROR'
}
