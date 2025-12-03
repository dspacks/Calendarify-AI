# API Documentation

This document provides detailed information about the internal APIs and functions used in Calendarify AI.

## 📋 Table of Contents

- [Services](#services)
  - [Gemini Service](#gemini-service)
- [Utilities](#utilities)
  - [ICS Parser](#ics-parser)
- [Types](#types)
- [Components API](#components-api)
- [Environment Variables](#environment-variables)
- [Error Handling](#error-handling)

---

## 🤖 Services

### Gemini Service

**Location**: `services/geminiService.ts`

Handles all interactions with the Google Gemini AI API for image generation.

#### `generateDayImage()`

Generates AI artwork for a day's events.

**Signature**:
```typescript
generateDayImage(
  eventSummaries: string[],
  customPrompt?: string
): Promise<string | null>
```

**Parameters**:
- `eventSummaries` (string[]): Array of event titles for the day
- `customPrompt` (string, optional): Custom text to inject into the AI prompt for creative variations

**Returns**:
- `Promise<string | null>`: Base64 encoded image data URL, or null if generation fails

**Example**:
```typescript
const events = ["Team Meeting", "Lunch with Client", "Code Review"];
const imageData = await generateDayImage(events, "Add a fun robot mascot");

if (imageData) {
  // Use imageData as src for img tag or background-image
  setDayImage(imageData);
}
```

**Behavior**:
- Creates soft, faded watercolor painting style images
- Uses 1:1 aspect ratio for square day cells
- Maintains light, minimal aesthetic for text readability
- Returns null on API errors or failures
- Automatically formats response as data URL

**AI Model**: `gemini-2.5-flash-image`

---

#### `generateMonthHeader()`

Generates themed header banner images for calendar months.

**Signature**:
```typescript
generateMonthHeader(
  monthName: string,
  theme?: string
): Promise<string | null>
```

**Parameters**:
- `monthName` (string): Full month name (e.g., "January", "February")
- `theme` (string, optional): Custom theme description (default: "Tollgate Elementary School Gators (Pickerington Local School District)")

**Returns**:
- `Promise<string | null>`: Base64 encoded image data URL, or null if generation fails

**Example**:
```typescript
const headerImage = await generateMonthHeader(
  "December",
  "Winter Wonderland with snowflakes and pine trees"
);
```

**Behavior**:
- Creates wide panoramic illustrations
- Uses 16:9 aspect ratio for banner display
- Playful watercolor style
- No text or numbers in generated image
- Returns null on failures

**AI Model**: `gemini-2.5-flash-image`

---

## 🔧 Utilities

### ICS Parser

**Location**: `utils/icsParser.ts`

Parses ICS (iCalendar) calendar files into JavaScript objects.

#### `parseICS()`

Parses ICS file content and extracts calendar events.

**Signature**:
```typescript
parseICS(icsContent: string): CalendarEvent[]
```

**Parameters**:
- `icsContent` (string): Raw ICS file content as text

**Returns**:
- `CalendarEvent[]`: Array of parsed calendar events

**Example**:
```typescript
const fileContent = await file.text();
const events = parseICS(fileContent);

console.log(events);
// [
//   {
//     id: "abc123",
//     title: "Team Meeting",
//     description: "Quarterly planning",
//     startDate: Date,
//     endDate: Date,
//     allDay: false
//   },
//   ...
// ]
```

**Supported Fields**:
- `SUMMARY` → `title`
- `DESCRIPTION` → `description`
- `DTSTART` → `startDate`
- `DTEND` → `endDate`

**Date Formats Supported**:
- `YYYYMMDD` (all-day events)
- `YYYYMMDDTHHMMSSZ` (timed events with UTC)
- `YYYYMMDDTHHMMSS` (timed events, local time)

**Features**:
- Handles multi-line values
- Strips ICS formatting
- Generates unique IDs for events without UID
- Treats malformed dates as null
- Determines all-day events heuristically

**Limitations**:
- Does not support recurring events (RRULE)
- Timezone data (VTIMEZONE) is ignored
- VALARM (reminders) not parsed
- Only VEVENT components are processed

---

## 📐 Types

**Location**: `types.ts`

### `CalendarEvent`

Represents a single calendar event.

```typescript
interface CalendarEvent {
  id: string;              // Unique identifier
  title: string;           // Event title/summary
  description?: string;    // Optional event description
  startDate: Date;         // Start date/time
  endDate?: Date;          // Optional end date/time
  allDay: boolean;         // Whether event is all-day
}
```

---

### `DayData`

Represents a calendar day with its events and generated art.

```typescript
interface DayData {
  date: Date;              // The calendar date
  events: CalendarEvent[]; // Events on this day
  imageData?: string;      // Base64 image data (if generated)
  isGenerating?: boolean;  // Whether AI art is currently generating
}
```

---

### `LoadingState`

Enum representing application loading states.

```typescript
enum LoadingState {
  IDLE = 'IDLE',                      // No operation in progress
  PARSING = 'PARSING',                // Parsing ICS files
  GENERATING_IMAGES = 'GENERATING_IMAGES', // Generating AI art
  ERROR = 'ERROR'                     // Error state
}
```

---

## 🧩 Components API

### `<App />`

**Location**: `App.tsx`

Root application component.

**Props**: None

**State**:
- `events: CalendarEvent[]` - All loaded calendar events
- `hasFile: boolean` - Whether user has uploaded a file

**Key Methods**:
- `handleEventsLoaded(events)` - Called when ICS file is parsed
- `handleBack()` - Returns to upload view

---

### `<FileUpload />`

**Location**: `components/FileUpload.tsx`

Handles ICS file upload and parsing.

**Props**:
```typescript
interface FileUploadProps {
  onEventsLoaded: (events: CalendarEvent[]) => void;
}
```

**Features**:
- Drag-and-drop support
- Multiple file upload
- Automatic file validation (.ics only)
- Event deduplication
- Error handling and display

**Events**:
- `onEventsLoaded` - Fired when files are successfully parsed

---

### `<CalendarView />`

**Location**: `components/CalendarView.tsx`

Main calendar display with month grid and controls.

**Props**:
```typescript
interface CalendarViewProps {
  events: CalendarEvent[];
  onBack: () => void;
}
```

**State Management**:
- `currentDate` - Currently displayed month
- `generatedImages` - Map of date strings to image data
- `headerImage` - Monthly header banner image
- `generatingStatus` - Which days are currently generating
- `generationProgress` - Bulk generation progress
- `headerTheme` - Custom theme for headers
- `dailyPrompt` - Custom prompt injection for daily art

**Key Methods**:
- `handleGenerateImage(date)` - Generate art for a specific day
- `handleGenerateHeader()` - Generate monthly header
- `handleGenerateAll()` - Batch generate for all days with events
- `handleExportPDF()` - Export calendar as PDF
- `stopGeneration()` - Cancel bulk generation

**Rate Limiting**:
- 4-second delay between requests
- Sequential processing to respect API limits
- Cancellable operations

---

### `<DayCell />`

**Location**: `components/DayCell.tsx`

Individual day cell in the calendar grid.

**Props**:
```typescript
interface DayCellProps {
  day: DayData;
  isCurrentMonth: boolean;
  onGenerateArt: (date: Date) => void;
}
```

**Features**:
- Displays date and events
- Shows AI-generated background
- Hover-triggered generation button
- Loading spinner during generation
- Truncates long event lists (shows first 5)

---

## 🔐 Environment Variables

### Required Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `GEMINI_API_KEY` | string | Google Gemini API key | `AIzaSyD...` |

### Configuration in Code

The Vite configuration (`vite.config.ts`) exposes environment variables:

```typescript
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}
```

### Getting an API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Generate a new API key
4. Add to `.env.local` file

**Free Tier Limits**:
- ~15 requests per minute
- ~1,500 requests per day
- Subject to change by Google

---

## ⚠️ Error Handling

### Service Level

All service functions return `null` on failure:

```typescript
try {
  const image = await generateDayImage(events);
  if (image) {
    // Success
  } else {
    // Handle failure (null returned)
  }
} catch (error) {
  // Handle exception
  console.error("Generation failed:", error);
}
```

### Component Level

Components handle errors gracefully:

```typescript
// FileUpload component
if (validFiles.length === 0) {
  setError("Please upload at least one valid .ics file.");
  return;
}

// CalendarView component
try {
  await handleGenerateImage(date);
} catch (error) {
  console.error("Failed to generate", error);
} finally {
  setGeneratingStatus(prev => ({ ...prev, [dayKey]: false }));
}
```

### Common Error Scenarios

| Error | Cause | Solution |
|-------|-------|----------|
| API Key missing | `GEMINI_API_KEY` not set | Add to `.env.local` |
| Rate limit exceeded | Too many requests | Wait or implement backoff |
| Invalid ICS file | Malformed or non-ICS file | Validate file format |
| PDF export fails | Large calendar or browser limits | Reduce image count or try different browser |
| Image generation fails | API error or bad prompt | Retry or modify prompt |

---

## 🔄 Rate Limiting

### Implementation

```typescript
// Sequential generation with delays
for (let i = 0; i < daysToGenerate.length; i++) {
  if (signal.aborted) break;

  await handleGenerateImage(daysToGenerate[i]);

  // 4-second delay between requests
  if (i < daysToGenerate.length - 1) {
    await new Promise(resolve => setTimeout(resolve, 4000));
  }
}
```

### Recommendations

- **Free Tier**: Keep default 4-second delay
- **Paid Tier**: Reduce delay or parallelize requests
- **Error Handling**: Implement exponential backoff on 429 errors

---

## 🧪 Testing APIs

### Manual Testing

```javascript
// Test ICS Parser
const testICS = `
BEGIN:VCALENDAR
BEGIN:VEVENT
SUMMARY:Test Event
DTSTART:20250101
DTEND:20250102
END:VEVENT
END:VCALENDAR
`;

const events = parseICS(testICS);
console.log(events);
```

### Testing with Real Data

1. Export calendar from Google Calendar or Outlook
2. Use FileUpload component to test parsing
3. Verify all events are correctly extracted
4. Check date formatting and all-day detection

---

## 📚 Additional Resources

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [ICS Format Specification (RFC 5545)](https://datatracker.ietf.org/doc/html/rfc5545)
- [React Documentation](https://react.dev/)
- [date-fns Documentation](https://date-fns.org/docs/Getting-Started)

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-01 | Initial API documentation |

---

For questions or clarifications, please open an issue on GitHub.
