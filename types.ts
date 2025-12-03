export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  allDay: boolean;
}

export interface DayData {
  date: Date;
  events: CalendarEvent[];
  imageData?: string; // Base64 string
  isGenerating?: boolean;
}

export enum LoadingState {
  IDLE = 'IDLE',
  PARSING = 'PARSING',
  GENERATING_IMAGES = 'GENERATING_IMAGES',
  ERROR = 'ERROR'
}
